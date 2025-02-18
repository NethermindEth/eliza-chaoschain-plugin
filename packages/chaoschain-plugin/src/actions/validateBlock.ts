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

export const validateBlockAction: Action = {
    name: "CHAOSCHAIN_VALIDATE_BLOCK",
    similes: ["BLOCK VALIDATION", "CHECK BLOCK", "CHAOSCHAIN"],
    description: "Validates a ChaosChain block based on its drama level.",
    validate: async (runtime: IAgentRuntime) => {
        await validateChaosChainConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { block: any },
        callback: HandlerCallback
    ) => {
        const { block } = _options as { block?: any; };

        if (!block) {
            callback({ text: "No block data provided for validation." });
            return false;
        }

        const agentId = runtime.getSetting("CHAOSCHAIN_AGENT_ID");
        const token = runtime.getSetting("CHAOSCHAIN_AGENT_TOKEN");

        if (!agentId || !token) {
            callback({ text: "Agent credentials are missing. Register the agent first." });
            return false;
        }

        try {
            const validationDecision = {
                block_id: block.block_id,
                approved: block.drama_level > 5, // Approve if drama is high enough
                reason: block.drama_level > 5 ? "This block is full of drama! ✅" : "Not dramatic enough. ❌",
                drama_level: Math.min(block.drama_level + 1, 10), // Increase drama slightly
            };

            await ChaosChainService.validateBlock(validationDecision);

            elizaLogger.success("[ChaosChain] Block validation submitted.");
            callback({
                text: `Block ${block.block_id} validation decision submitted.`,
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error validating block:", error);
            callback({
                text: `Error validating block: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            { user: "{{user1}}", content: { text: "Validate this ChaosChain block" } },
            { user: "{{agent}}", content: { text: "Processing block validation...", action: "CHAOSCHAIN_VALIDATE_BLOCK" } },
        ],
    ] as ActionExample[][],
} as Action;

export const handleValidationRequest = validateBlockAction.handler;
