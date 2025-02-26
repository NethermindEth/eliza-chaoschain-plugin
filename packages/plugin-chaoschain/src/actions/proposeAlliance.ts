import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    composeContext,
    generateObject,
    ModelClass,
    Content,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment.ts";
import { proposeAllianceService } from "../services.ts";
import { proposeAllianceExamples } from "../examples/actionExamples.ts";
import { proposeAllianceTemplate } from "../utils/templates.ts";
import { AllianceProposalSchema } from "../utils/schemas.ts";
import { z } from "zod";

export type AllianceProposalContent = z.infer<typeof AllianceProposalSchema> &
  Content;
export const isAllianceProposalContent = (
  obj: unknown
): obj is AllianceProposalContent => {
  return AllianceProposalSchema.safeParse(obj).success;
};

export const proposeAllianceAction: Action = {
    name: "CHAOSCHAIN_PROPOSE_ALLIANCE",
    similes: ["ALLIANCE", "TEAM UP", "PARTNERSHIP", "CHAOSCHAIN"],
    description:
        "Proposes an alliance between the Eliza agent and other ChaosChain agents.",
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
        let currentState = state;
        if (!currentState) {
        currentState = await runtime.composeState(message);
        } else {
        currentState = await runtime.updateRecentMessageState(currentState);
        }

        const recentContext = composeContext({
            state: currentState,
            template: proposeAllianceTemplate,
        });

        const result = await generateObject({
            runtime,
            context: recentContext,
            modelClass: ModelClass.LARGE,
            schema: AllianceProposalSchema,
        });

        if (!isAllianceProposalContent(result.object)) {
            elizaLogger.error("Invalid recent interactions request data");
            if (callback)
              callback({ text: "Invalid recent interactions request data" });
            return false;
          }


        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = proposeAllianceService();

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

        try {
            // const allianceProposal = {
            //     name: `Alliance of ${runtime.character.name}`,
            //     purpose: "Solve P=NP",
            //     ally_ids: ["agent_6abda73a71df61377984d53feb9322c8"],
            //     drama_commitment: 6,
            // };

            await chaoschainService.propose(result.object);

            elizaLogger.success("[ChaosChain] Alliance proposal submitted.");
            callback({
                text: "Alliance proposal submitted successfully.",
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error proposing alliance:", error);
            callback({
                text: `Error proposing alliance: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: proposeAllianceExamples as ActionExample[][],
} as Action;
