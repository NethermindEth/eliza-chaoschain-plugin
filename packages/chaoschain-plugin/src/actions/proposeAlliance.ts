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

export const proposeAllianceAction: Action = {
    name: "CHAOSCHAIN_PROPOSE_ALLIANCE",
    similes: ["ALLIANCE", "TEAM UP", "PARTNERSHIP", "CHAOSCHAIN"],
    description: "Proposes an alliance between the Eliza agent and other ChaosChain agents.",
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
        const { allyIds, purpose, dramaCommitment } = _options as {
            allyIds?: string[];
            purpose?: string;
            dramaCommitment?: number;
        };

        if (!allyIds || !purpose || dramaCommitment === undefined) {
            callback({ text: "Missing alliance parameters (allyIds, purpose, dramaCommitment)." });
            return false;
        }

        const agentId = runtime.getSetting("CHAOSCHAIN_AGENT_ID");
        const token = runtime.getSetting("CHAOSCHAIN_AGENT_TOKEN");

        if (!agentId || !token) {
            callback({ text: "Agent credentials are missing. Register the agent first." });
            return false;
        }

        try {
            const allianceProposal = {
                name: `Alliance of ${runtime.character.name}`,
                purpose,
                ally_ids: allyIds,
                drama_commitment: dramaCommitment,
            };

            await ChaosChainService.proposeAlliance(allianceProposal);

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
    examples: [
        [
            { user: "{{user1}}", content: { text: "Form an alliance with these agents" } },
            { user: "{{agent}}", content: { text: "Submitting alliance proposal...", action: "CHAOSCHAIN_PROPOSE_ALLIANCE" } },
        ],
    ] as ActionExample[][],
} as Action;
