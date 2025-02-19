import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";

import {
  AgentRuntime,
  CacheManager,
  CacheStore,
  DbCacheAdapter,
  elizaLogger,
  FsCacheAdapter,
  ICacheManager,
  IDatabaseAdapter,
  IDatabaseCacheAdapter,
  stringToUuid,
  UUID,
  defaultCharacter,
} from "@elizaos/core";
import { DirectClient } from "@elizaos/client-direct";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import chaoschainPlugin from "@elizaos/plugin-chaoschain";

import yargs from "yargs";
import Database from "better-sqlite3";

import {
  Character,
  ModelProviderName,
  settings,
  validateCharacterConfig,
} from "@elizaos/core";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


enum Clients {
    DIRECT = "direct",
    TWITTER = "twitter",
    AUTO = "auto",
    TELEGRAM = "telegram"
}

interface CharacterSettings {
  model?: string;
  secrets?: {
    [key: string]: string;
  };
  engagement?: {
    minTimeBetweenInteractions: number;
    maxDailyInteractions: number;
    interactionTypes: string[];
    contentFilters: {
      minFollowers: number;
      excludeNSFW: boolean;
      languagePreference: string;
      relevanceThreshold: number;
    };
  };
}

interface ExtendedCharacter extends Character {
  settings?: CharacterSettings;
  pluginConfig?: {
    [key: string]: any;
  };
}

const character: ExtendedCharacter = {
  ...defaultCharacter,
  name: "ChainTraderX",
  id: stringToUuid("trader-agent"),
  username: "ChainTraderX",
  clients: [Clients.TELEGRAM],
};

function getSetting(key: string): string | undefined {
  return process.env[key];
}

async function startAgent(
  character: ExtendedCharacter,
  directClient: DirectClient,
) {
  try {
    elizaLogger.info(`Starting agent for character: ${character.name}`);

    // Create data directory with absolute path
    const dataDir = path.resolve(__dirname, "..", "data");
    elizaLogger.info(`Using data directory: ${dataDir}`);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      elizaLogger.info(`Created data directory: ${dataDir}`);
    }

    const db = initializeDatabase(dataDir);
    await db.init().catch((error: Error) => {
      const err = error as Error;
      elizaLogger.error("Failed to initialize database:", {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    });

    const cache = initializeCache(
      process.env.CACHE_STORE ?? CacheStore.FILESYSTEM,
      character,
      dataDir,
      db as IDatabaseCacheAdapter
    );

    const token = getTokenForProvider(character.modelProvider, character);
    if (!token) {
      throw new Error(
        `No API token found for provider ${character.modelProvider}`
      );
    }

    elizaLogger.info("Creating agent runtime...");
    const runtime = new AgentRuntime({
      character,
      token,
      modelProvider: character.modelProvider,
      databaseAdapter: db,
      cacheManager: cache,
      plugins:  [chaoschainPlugin],
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

    elizaLogger.info("Starting Telegram client...");
    const telegramClient = await TelegramClientInterface.start(runtime).catch((error: Error) => {
        const err = error as Error;
        elizaLogger.error("Failed to start Telegram client:", {
            error: err.message,
            stack: err.stack
        });
        throw error;
    });

    if (telegramClient) {
        runtime.clients = { telegram: telegramClient };
        elizaLogger.info("Telegram client initialized successfully");
    }

    elizaLogger.info("Registering agent with direct client...");
    directClient.registerAgent(runtime);

    elizaLogger.info(`Started ${character.name} as ${runtime.agentId}`);
    return runtime;
  } catch (error) {
    const err = error as Error;
    elizaLogger.error("Error starting agent:", {
      error: err.message,
      stack: err.stack,
      character: character.name,
    });
    throw error;
  }
}

export async function startAgents() {
  elizaLogger.info("Starting agents...");
  const directClient = new DirectClient();
  let serverPort = parseInt("3001");
  const args = parseArguments();
  const charactersArg = args.characters || args.character;

  if (!charactersArg) {
    elizaLogger.error(
      "No character file specified. Please provide a character file path using --character or --characters."
    );
    process.exit(1);
  }

  const characters = await loadCharacters(charactersArg);

  

  try {
    for (const character of characters) {
      await startAgent(character, directClient);
    }
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
    process.exit(1);
  }

  while (!(await checkPortAvailable(serverPort))) {
    elizaLogger.warn(`Port ${serverPort} is in use, trying ${serverPort + 1}`);
    serverPort++;
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log("Server port: ", serverPort);

  directClient.start(serverPort);

  if (serverPort !== parseInt(settings.SERVER_PORT || "3001")) {
    elizaLogger.log(`Server started on alternate port ${serverPort}`);
  }

  elizaLogger.log(
    "Run `pnpm start:client` to start the client and visit http://localhost:5173 to chat with your agents."
  );
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
        server.close(() => {
            // Wait a short time to ensure the OS releases the port
            setTimeout(() => resolve(true), 100); // Adjust delay as needed
          });
    });
    server.listen(port);
  });
};

export async function initializeClients(
  character: ExtendedCharacter,
  runtime: AgentRuntime
): Promise<Record<string, any>> {
  const clients: Record<string, any> = {};
  return clients;
}

function initializeDatabase(dataDir: string) {
  const dbPath = path.resolve(dataDir, "alithra.db");
  elizaLogger.info(`Initializing SQLite database at absolute path: ${dbPath}`);

  try {
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new SqliteDatabaseAdapter(new Database(dbPath));
    return db;
  } catch (error) {
    const err = error as Error;
    elizaLogger.error("Failed to initialize database:", {
      error: err.message,
      stack: err.stack,
      path: dbPath,
    });
    throw error;
  }
}

function initializeCache(
  cacheStore: string,
  character: ExtendedCharacter,
  baseDir: string = "",
  db?: IDatabaseCacheAdapter
) {
  const defaultId = "00000000-0000-0000-0000-000000000000";
  const cacheDir = path.resolve(baseDir, character.id || defaultId, "cache");

  elizaLogger.info(`Initializing cache with store type: ${cacheStore}`);
  elizaLogger.info(`Cache directory: ${cacheDir}`);

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  if (cacheStore === CacheStore.DATABASE) {
    if (db) {
      elizaLogger.info("Using Database Cache...");
      return new CacheManager(new DbCacheAdapter(db, character.id as UUID));
    }
    throw new Error(
      "Database adapter is not provided for DATABASE cache store."
    );
  }

  // Default to filesystem cache
  elizaLogger.info("Using File System Cache...");
  return new CacheManager(new FsCacheAdapter(cacheDir));
}

export function getTokenForProvider(
  provider: ModelProviderName,
  character: ExtendedCharacter
): string {
  let token = "";
  switch (provider) {
    case ModelProviderName.OPENAI:
      token =
        character.settings?.secrets?.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY ||
        "";
      break;
    case ModelProviderName.ANTHROPIC:
      token =
        character.settings?.secrets?.ANTHROPIC_API_KEY ||
        character.settings?.secrets?.CLAUDE_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.CLAUDE_API_KEY ||
        "";
      break;
    default:
      elizaLogger.error(`Unsupported model provider: ${provider}`);
  }
  return token;
}

async function createAgent(
  character: ExtendedCharacter,
  db: IDatabaseAdapter,
  cache: ICacheManager,
  token: string
): Promise<AgentRuntime> {
  elizaLogger.info("Creating runtime for character", character.name);

  const runtime = new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider || ModelProviderName.OPENAI,
    evaluators: [],
    character,
    plugins: [],
    providers: [],
    managers: [],
    cacheManager: cache,
  });

  return runtime;
}

export function parseArguments(): {
  character?: string;
  characters?: string;
} {
  try {
    return yargs(process.argv.slice(2))
      .option("character", {
        type: "string",
        description: "Path to the character JSON file",
      })
      .option("characters", {
        type: "string",
        description: "Comma separated list of paths to character JSON files",
      })
      .parseSync();
  } catch (error) {
    elizaLogger.error("Error parsing arguments:", error);
    return {};
  }
}

export async function loadCharacters(
  charactersArg: string
): Promise<ExtendedCharacter[]> {
  let characterPaths = charactersArg
    ?.split(",")
    .map((filePath) => filePath.trim());
  const loadedCharacters: ExtendedCharacter[] = [];

  if (characterPaths?.length > 0) {
    for (const characterPath of characterPaths) {
      const content = tryLoadFile(characterPath);
      if (content === null) {
        elizaLogger.error(
          `Error loading character from ${characterPath}: File not found`
        );
        process.exit(1);
      }

      try {
        const character = JSON.parse(content) as ExtendedCharacter;
        validateCharacterConfig(character);
        loadedCharacters.push(character);
        elizaLogger.info(
          `Successfully loaded character from: ${characterPath}`
        );
      } catch (e) {
        elizaLogger.error(
          `Error parsing character from ${characterPath}: ${e}`
        );
        process.exit(1);
      }
    }
  }

  if (loadedCharacters.length === 0) {
    elizaLogger.error(
      "No characters found. Please provide a character file path."
    );
    process.exit(1);
  }

  return loadedCharacters;
}

function tryLoadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return null;
  }
}

startAgents().catch((error) => {
    elizaLogger.error("Unhandled error in startAgents:", error);
    process.exit(1);
}); 
