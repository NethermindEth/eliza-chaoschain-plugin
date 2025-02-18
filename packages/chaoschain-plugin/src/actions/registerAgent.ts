import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateChaosChainConfig } from "../environment";
import { ChaosChainService } from "../services";

export const registerAgentAction: Action = {
    name: "CHAOSCHAIN_REGISTER_AGENT",
    similes: ["REGISTER", "AGENT", "CHAOSCHAIN"],
    description: "Registers the Eliza agent with ChaosChain.",
    validate: async (runtime: IAgentRuntime) => {
        await validateChaosChainConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateChaosChainConfig(runtime);
        const agentData = {
            name: runtime.character.name || "ElizaAgent",
            personality: runtime.character.adjectives || ["strategic", "dramatic"],
            style: "analytical",
            stake_amount: 1000,
            role: "validator" as "validator" | "proposer", // ✅ Fix 1: Explicit role type
        };

        try {
            const response = await ChaosChainService.registerAgent(agentData);

            // ✅ Fix 2: Use memory.set() instead of setSetting()
            // runtime.memory.set("CHAOSCHAIN_AGENT_ID", response.agent_id);
            // runtime.memory.set("CHAOSCHAIN_AGENT_TOKEN", response.token);

            elizaLogger.success("[ChaosChain] Agent registered successfully.");
            callback({
                text: "Agent successfully registered with ChaosChain!",
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error registering agent:", error);
            callback({
                text: `Error registering agent: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            { user: "{{user1}}", content: { text: "Register Eliza on ChaosChain" } },
            { user: "{{agent}}", content: { text: "Registering Eliza on ChaosChain...", action: "CHAOSCHAIN_REGISTER_AGENT" } },
        ],
    ] as ActionExample[][],
} as Action;
