import { registerChaosAgent } from "./chaosAgent";
import { startWebSocketListener } from "./websocketHandler";
import { proposeTransaction } from "./transaction";
import { proposeAlliance } from "./alliances";

async function getRuntime() {
  try {
      const { getAgentRuntime } = require("@elizaos/core");
      return await getAgentRuntime();  // Fetch runtime dynamically from ElizaOS
  } catch (error) {
      console.error("[ChaosChain] Failed to fetch ElizaOS runtime:", error);
      return null;
  }
}

// Main function to initialize Eliza plugin
export async function initChaosPlugin() {
  const runtime = await getRuntime();
  if (!runtime) {
      console.error("[ChaosChain] ElizaOS runtime not found. Plugin will not start.");
      return;
  }

  console.log("[ChaosChain] Initializing with ElizaOS runtime...");
  await registerChaosAgent(runtime);
  await startWebSocketListener(runtime);
}

// Auto-start when running inside ElizaOS
initChaosPlugin();

// Export helper functions for external usage
export { proposeTransaction, proposeAlliance };

// Ensure plugin initializes when imported
export default initChaosPlugin;
