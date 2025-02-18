import { Plugin } from "@elizaos/core";
import { registerAgentAction } from "./actions/registerAgent";
import { validateBlockAction } from "./actions/validateBlock";
import { proposeTransactionAction } from "./actions/proposeTransaction";
import { proposeAllianceAction } from "./actions/proposeAlliance";
import { startWebSocketListener } from "./websocketHandler";

// ChaosChain provider to initialize the plugin
const chaosChainProvider = {
    name: "ChaosChain Provider",
    initialize: async (runtime) => {
        console.log("[ChaosChain] Initializing plugin...");

        // Register agent if not registered
        await registerAgentAction.handler(runtime, null, null, {}, async () => []);

        // Start WebSocket listener
        await startWebSocketListener(runtime);
    },
    get: async () => null, // ✅ Fix: Adding required `get` function
};

// Define the ChaosChain plugin
export const chaosChainPlugin: Plugin = {
    name: "chaoschain",
    description: "ChaosChain plugin for ElizaOS, enabling AI agents to validate blocks, propose transactions, and form alliances.",
    actions: [registerAgentAction, validateBlockAction, proposeTransactionAction, proposeAllianceAction],
    evaluators: [],
    providers: [chaosChainProvider],
};

export default chaosChainPlugin;
