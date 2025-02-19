import path, { dirname } from "path";
import * as fs from "fs";
import chaoschainPlugin from "@elizaos/plugin-chaoschain";
import { AutoClientInterface } from "./autoClient.js";
import {
  initializeDatabase,
  initializeCache,
  getTokenForProvider,
  loadCharacters,
  parseArguments,
} from "./utils.js";
import { DirectClient } from "@elizaos/client-direct";
import { AgentRuntime, elizaLogger } from "@elizaos/core";
import { fileURLToPath } from "url";
import { TelegramClientInterface } from "@elizaos/client-telegram";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initializes and starts ChaosChain agents using the Eliza framework.
 * The agent subscribes to WebSocket events for block proposals and validation requests,
 * delegating decision-making to registered actions.
 */
export async function startChaosAgent(): Promise<void> {
  // Parse command-line arguments for the character configuration file.
  const args = parseArguments();
  const characterConfigPath = args.character || args.characters;
  if (!characterConfigPath) {
    elizaLogger.error(
      "No character file specified (please use --character or --characters)."
    );
    process.exit(1);
  }

  // Load character configurations.
  const characters = await loadCharacters(characterConfigPath);

  // Create a DirectClient for handling inbound events.
  const directClient = new DirectClient();

  for (const character of characters) {
    elizaLogger.info(`Starting agent for character: ${character.name}`);
    const token = getTokenForProvider(character.modelProvider, character);
    if (!token) {
      throw new Error(
        `Missing token for model provider: ${character.modelProvider}`
      );
    }

    // Create data directory with absolute path
    const dataDir = path.resolve(__dirname, "..", "data");
    elizaLogger.info(`Using data directory: ${dataDir}`);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      elizaLogger.info(`Created data directory: ${dataDir}`);
    }

    // Initialize the database adapter and cache.
    const db = initializeDatabase(dataDir);
    await db.init().catch((error: Error) => {
      const err = error as Error;
      elizaLogger.error("Failed to initialize database:", {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    });

    const cacheManager = initializeCache(
      process.env.CACHE_STORE ?? "FILESYSTEM",
      character,
      dataDir,
      db
    );

    // Create the agent runtime.
    const runtime = new AgentRuntime({
      character,
      token,
      modelProvider: character.modelProvider,
      databaseAdapter: db,
      cacheManager,
      plugins: [chaoschainPlugin],
      evaluators: [],
      providers: [],
      actions: [],
      managers: [],
    });

    elizaLogger.info("Initializing agent runtime...");
    await runtime.initialize().catch((error) => {
      const err = error as Error;
      elizaLogger.error("Failed to initialize runtime:", {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    });

    // Initialize the Telegram client.
    elizaLogger.info("Starting Telegram client...");
    const telegramClient = await TelegramClientInterface.start(runtime).catch(
      (error: Error) => {
        const err = error as Error;
        elizaLogger.error("Failed to start Telegram client:", {
          error: err.message,
          stack: err.stack,
        });
        throw error;
      }
    );

    if (telegramClient) {
      runtime.clients = { telegram: telegramClient };
      elizaLogger.info("Telegram client initialized successfully");
    }

    // Register the agent to handle incoming events.
    elizaLogger.info("Registering agent with direct client...");
    directClient.registerAgent(runtime);

    const autoClient = await AutoClientInterface.start(runtime).catch(
      (error: Error) => {
        const err = error as Error;
        elizaLogger.error("Failed to start Telegram client:", {
          error: err.message,
          stack: err.stack,
        });
        throw error;
      }
    );

    if (autoClient) {
      runtime.clients.auto = autoClient;
      elizaLogger.info("Auto client initialized successfully");
    }

    elizaLogger.info(`Started ${character.name} as ${runtime.agentId}`);
  }

  // Start the DirectClient server to receive events.
  const port = parseInt(process.env.SERVER_PORT || "3001", 10);
  directClient.start(port);
  elizaLogger.info(`ChaosChain agent is running and listening on port ${port}`);
}
