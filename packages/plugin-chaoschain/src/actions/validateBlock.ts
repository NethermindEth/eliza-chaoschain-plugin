import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    Content,
    ModelClass,
    generateObject,
    composeContext,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment";
import { validateBlockService } from "../services";
import { validateBlockExamples } from "../examples/actionExamples";
import { BlockValidationDecision } from "../types";
import { BlockValidationSchema } from "../utils/schemas";
import { z } from "zod";
import { blockValidationTemplate } from "../utils/templates";

export type SubmitVoteContent = z.infer<typeof BlockValidationSchema> & Content;
export const isSubmitVoteContent = (obj: unknown): obj is SubmitVoteContent => {
    return BlockValidationSchema.safeParse(obj).success;
};

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
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = validateBlockService();

        let currentState = state;
        if (!currentState) {
            currentState = await runtime.composeState(message);
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        // Update the template or define your own logic for approving or rejecting the block
        const voteContext = composeContext({
            state: currentState,
            template: blockValidationTemplate,
        });

        const result = await generateObject({
            runtime,
            context: voteContext,
            modelClass: ModelClass.LARGE,
            schema: BlockValidationSchema,
        });

        if (!isSubmitVoteContent(result.object)) {
            elizaLogger.error("Invalid vote data format received");
            if (callback)
                callback({ text: "Invalid vote data format received" });
            return false;
        }
        const generatedParams = result.object;

        const { agent_id, agent_token } = JSON.parse(
            await runtime.cacheManager.get(message.roomId)
        );

        console.log("AGENT DETAILS", agent_id, agent_token);

        if (!agent_id || !agent_token) {
            callback({
                text: "Agent credentials are missing. Register the agent first.",
            });
            return false;
        }

        // const validationDecision: BlockValidationDecision = {
        //     block_id: block.block_id,
        //     approved: block.drama_level > 5, // Approve if drama is high enough
        //     reason: block.drama_level > 5 ? "This block is full of drama! ✅" : "Not dramatic enough. ❌",
        //     drama_level: Math.min(block.drama_level + 1, 10), // Increase drama slightly
        // };

        try {
            elizaLogger.info("payload", generatedParams)
            const response = await chaoschainService.validate(generatedParams, agent_id, agent_token);

            elizaLogger.success(
                "[ChaosChain] Block validation submitted.",
                response
            );
            callback({
                text: `Block ${generatedParams?.block_id} validation decision submitted!`,
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
