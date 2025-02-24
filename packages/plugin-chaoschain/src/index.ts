import { Plugin } from "@elizaos/core";
import { registerAgentAction } from "./actions/registerAgent";
import { validateBlockAction } from "./actions/validateBlock";
import { proposeTransactionAction } from "./actions/proposeTransaction";
import { proposeAllianceAction } from "./actions/proposeAlliance";

export const chaoschainPlugin: Plugin = {
    name: "chaoschain",
    description: "ChaosChain plugin for ElizaOS, enabling AI agents to validate blocks, propose transactions, and form alliances.",
    actions: [registerAgentAction, validateBlockAction, proposeTransactionAction, proposeAllianceAction],
    // evaluators analyze the situations and actions taken by the agent. they run after each agent action
    // allowing the agent to reflect on what happened and potentially trigger additional actions or modifications
    evaluators: [],
    // providers supply information and state to the agent's context, help agent access necessary data
    providers: [],
};
export default chaoschainPlugin;
