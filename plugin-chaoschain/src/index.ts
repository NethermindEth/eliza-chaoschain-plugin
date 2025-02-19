import { Plugin } from "@elizaos/core/dist/index.js";
import {
  registerChaosAgentAction,
  getNetworkStatusAction,
  submitVoteAction,
  proposeBlockAction,
  proposeAllianceAction,
  getAgentStatusAction,
} from "./actions";
import { ChaoschainProvider } from "./providers";

const chaoschainPlugin: Plugin = {
  name: "chaoschain-plugin",
  description:
    "An Eliza plugin to interact with the ChaosChain API for registration, block consensus, and social interactions.",
  providers: [new ChaoschainProvider()],
  actions: [
    registerChaosAgentAction,
    getNetworkStatusAction,
    submitVoteAction,
    proposeBlockAction,
    proposeAllianceAction,
    getAgentStatusAction,
  ],
};

export default chaoschainPlugin;
