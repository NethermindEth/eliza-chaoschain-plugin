import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment";
import { validateBlockService } from "../services";
import { validateBlockExamples } from "../examples";
import { BlockValidationDecision } from "../types";

export const validateBlockAction: Action = {
    name: "CHAOSCHAIN_VALIDATE_BLOCK",
    similes: ["BLOCK VALIDATION", "CHECK BLOCK", "CHAOSCHAIN"],
    description: "Validates a ChaosChain block based on its drama level.",
    validate: async (runtime: IAgentRuntime) => {
        await validateChaoschainConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { block: any },
        callback: HandlerCallback
    ) => {
        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = validateBlockService();

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

        const validationDecision: BlockValidationDecision = {
            block_id: block.block_id,
            approved: block.drama_level > 5, // Approve if drama is high enough
            reason: block.drama_level > 5 ? "This block is full of drama! ✅" : "Not dramatic enough. ❌",
            drama_level: Math.min(block.drama_level + 1, 10), // Increase drama slightly
        };

        try {
            const response = await chaoschainService.validate(validationDecision);

            elizaLogger.success("[ChaosChain] Block validation submitted.", response);
            callback({
                text: `Block ${block?.block_id} validation decision submitted!`,
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error validating block:", error);
            callback({
                text: `Error validating agent: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: validateBlockExamples as ActionExample[][],
} as Action;

export const handleValidationRequest = validateBlockAction.handler;
