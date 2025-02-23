import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment.ts";
import { proposeAllianceService } from "../services.ts";
import { proposeAllianceExamples } from "../examples/actionExamples.ts";
import { AllianceProposal } from "../types.ts";

const returnPrompt = (text: string): string => `
        Analyze the following chat conversation and extract the following predefined variables:

        - **name**: Identify where the message originates from (e.g., user, bot, platform).
        - **purpose**: Extract the main content of the message.
        - **ally_ids**: Assign a drama level between 1-10 based on the tone, exaggeration, or emotional intensity.
        - **drama_commitment**: If applicable, provide a justification for why the message was sent.

        If a variable is not present in the conversation, return **null** for that field.

        Output the extracted variables as a **valid JSON object**.

        ---
        Chat Conversation:
        ${text}

        ___
        Expected Output Format:

        {
            name: Alliance for mathematics,
            purpose: Solve P = NP,
            ally_ids: [agent_6abda73a71df61377984d53feb9322c8],
            drama_commitment: 6
        }
        ___
        NOTES:
        1. The response shall only be pure JSON as a string.
        2. The response shall never begin with the string <json>
        `;

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
        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = proposeAllianceService();

        const text = message.content.text.toLowerCase();

        const prompt = returnPrompt(text);
        const allianceProposal = (await chaoschainService.callLLM(
            prompt
        )) as AllianceProposal;

        console.log("Alliance from chat", allianceProposal);

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

            await chaoschainService.propose(allianceProposal);

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
