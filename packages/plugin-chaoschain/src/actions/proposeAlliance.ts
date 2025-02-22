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
import { proposeAllianceExamples } from "../examples.ts";
import { AllianceProposal } from "../types.ts";

export const proposeAllianceAction: Action = {
    name: "CHAOSCHAIN_PROPOSE_ALLIANCE",
    similes: ["ALLIANCE", "TEAM UP", "PARTNERSHIP", "CHAOSCHAIN"],
    description: "Proposes an alliance between the Eliza agent and other ChaosChain agents.",
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

        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = proposeAllianceService();

        try {
            const allianceProposal: AllianceProposal = {
                name: `Alliance of ${runtime.character.name}`,
                purpose,
                ally_ids: allyIds,
                drama_commitment: dramaCommitment,
            };

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
