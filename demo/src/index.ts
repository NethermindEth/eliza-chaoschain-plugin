import { elizaLogger } from "@elizaos/core";
import { startChaosAgent } from "./agent.js";

async function main() {
  try {
    await startChaosAgent();
  } catch (error) {
    elizaLogger.error("Failed to start ChaosChain agent:", error);
    process.exit(1);
  }
}

main();
