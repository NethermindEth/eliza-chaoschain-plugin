import * as path from "path";
import Database from "better-sqlite3";
import {
  CacheManager,
  FsCacheAdapter,
  DbCacheAdapter,
  UUID,
  Character,
  elizaLogger,
  ModelProviderName,
  validateCharacterConfig,
} from "@elizaos/core";
import yargs from "yargs";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";

dotenv.config();

/**
 * Initializes the database adapter using better-sqlite3.
 */
export function initializeDatabase(dataDir: string) {
  const dbPath = path.resolve(dataDir, "chaoschain.db");
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

/**
 * Initializes the cache manager using either a filesystem or database adapter.
 */
export function initializeCache(
  storeType: string,
  character: any,
  dataDir: string,
  db: any
) {
  if (storeType === "FILESYSTEM") {
    return new CacheManager(new FsCacheAdapter(dataDir));
  } else {
    return new CacheManager(new DbCacheAdapter(db, character.id as UUID));
  }
}

interface CharacterSettings {
  model?: string;
  secrets?: {
    [key: string]: string;
  };
}

interface ExtendedCharacter extends Character {
  settings?: CharacterSettings;
  pluginConfig?: {
    [key: string]: any;
  };
}

export async function loadCharacters(
  charactersArg: string
): Promise<ExtendedCharacter[]> {
  const characterPaths = charactersArg
    .split(",")
    .map((filePath) => filePath.trim());
  const loadedCharacters: ExtendedCharacter[] = [];

  if (characterPaths.length > 0) {
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

function tryLoadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return null;
  }
}