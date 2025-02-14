import { registerChaosAgent } from "./chaosAgent";
import { startWebSocketListener } from "./websocketHandler";
import { proposeTransaction } from "./transaction";
import { proposeAlliance } from "./alliances";
import { IAgentRuntime } from "@elizaos/core";

// Main function to initialize Eliza plugin
export async function initChaosPlugin(runtime: IAgentRuntime) {
    console.log("[ChaosChain] Initializing Eliza plugin...");
    
    // Step 1: Register Eliza agent with ChaosChain
    await registerChaosAgent(runtime);
    
    // Step 2: Start WebSocket listener to handle real-time events
    await startWebSocketListener(runtime);
}

// Export helper functions for external usage
export { proposeTransaction, proposeAlliance };

// Ensure plugin initializes when imported
export default initChaosPlugin;
