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

export const proposeTransactionAction: Action = {
    name: "CHAOSCHAIN_PROPOSE_TRANSACTION",
    similes: ["TRANSACTION", "PROPOSE CONTENT", "CHAOSCHAIN"],
    description: "Proposes a creative transaction to ChaosChain with a drama rating.",
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
        const { content, dramaLevel } = _options as { content?: string; dramaLevel?: number };

        if (!content || dramaLevel === undefined) {
            callback({ text: "Missing content or drama level for the transaction." });
            return false;
        }

        const agentId = runtime.getSetting("CHAOSCHAIN_AGENT_ID");
        const token = runtime.getSetting("CHAOSCHAIN_AGENT_TOKEN");

        if (!agentId || !token) {
            callback({ text: "Agent credentials are missing. Register the agent first." });
            return false;
        }

        try {
            const transaction = {
                source: "ElizaAgent",
                content,
                drama_level: dramaLevel,
                justification: "This transaction embodies peak drama and must be recorded!",
                tags: ["drama", "chaos", "intensity"],
            };

            await ChaosChainService.proposeTransaction(transaction);

            elizaLogger.success("[ChaosChain] Transaction proposal submitted.");
            callback({
                text: "Transaction proposal submitted successfully.",
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error proposing transaction:", error);
            callback({
                text: `Error proposing transaction: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            { user: "{{user1}}", content: { text: "Submit a dramatic transaction to ChaosChain" } },
            { user: "{{agent}}", content: { text: "Submitting transaction...", action: "CHAOSCHAIN_PROPOSE_TRANSACTION" } },
        ],
    ] as ActionExample[][],
} as Action;
