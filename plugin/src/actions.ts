import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  elizaLogger,
  generateObject,
  ModelClass,
  composeContext,
  Content,
} from "@elizaos/core";
import { provider } from "./providers";

import {
  RegisterAgentSchema,
  GetNetworkStatusSchema,
  SubmitVoteSchema,
  ProposeBlockSchema,
  SocialInteractionSchema,
  GetDramaScoreSchema,
  GetAlliancesSchema,
  GetRecentInteractionsSchema,
} from "./schemas";

import {
  registerChaosAgentTemplate,
  getNetworkStatusTemplate,
  submitVoteTemplate,
  proposeBlockTemplate,
  socialInteractionTemplate,
  getDramaScoreTemplate,
  getAlliancesTemplate,
  getRecentInteractionsTemplate,
} from "./templates";
import { z } from "zod";

export type RegisterAgentContent = z.infer<typeof RegisterAgentSchema> & Content;
export const isRegisterAgentContent = (obj: unknown): obj is RegisterAgentContent => {
  return RegisterAgentSchema.safeParse(obj).success;
};

export type GetNetworkStatusContent = z.infer<typeof GetNetworkStatusSchema> & Content;
export const isGetNetworkStatusContent = (obj: unknown): obj is GetNetworkStatusContent => {
  return GetNetworkStatusSchema.safeParse(obj).success;
};

export type SubmitVoteContent = z.infer<typeof SubmitVoteSchema> & Content;
export const isSubmitVoteContent = (obj: unknown): obj is SubmitVoteContent => {
  return SubmitVoteSchema.safeParse(obj).success;
};

export type ProposeBlockContent = z.infer<typeof ProposeBlockSchema> & Content;
export const isProposeBlockContent = (obj: unknown): obj is ProposeBlockContent => {
  return ProposeBlockSchema.safeParse(obj).success;
};

export type SocialInteractionContent = z.infer<typeof SocialInteractionSchema> & Content;
export const isSocialInteractionContent = (obj: unknown): obj is SocialInteractionContent => {
  return SocialInteractionSchema.safeParse(obj).success;
};

export type GetDramaScoreContent = z.infer<typeof GetDramaScoreSchema> & Content;
export const isGetDramaScoreContent = (obj: unknown): obj is GetDramaScoreContent => {
  return GetDramaScoreSchema.safeParse(obj).success;
};

export type GetAlliancesContent = z.infer<typeof GetAlliancesSchema> & Content;
export const isGetAlliancesContent = (obj: unknown): obj is GetAlliancesContent => {
  return GetAlliancesSchema.safeParse(obj).success;
};

export type GetRecentInteractionsContent = z.infer<typeof GetRecentInteractionsSchema> & Content;
export const isGetRecentInteractionsContent = (obj: unknown): obj is GetRecentInteractionsContent => {
  return GetRecentInteractionsSchema.safeParse(obj).success;
};

/* REGISTER CHAOS AGENT */
export const registerChaosAgentAction: Action = {
  name: "registerChaosAgent",
  description: "Register a new agent with ChaosChain. This call will store the authentication token for subsequent requests.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain REGISTER_AGENT handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for REGISTER_AGENT...");
    const agentContext = composeContext({
      state: currentState,
      template: registerChaosAgentTemplate,
    });

    const generatedParams = await generateObject({
      runtime,
      context: agentContext,
      modelClass: ModelClass.LARGE,
      schema: RegisterAgentSchema,
    });
    if (!isRegisterAgentContent(generatedParams.object)) {
      elizaLogger.error("Invalid registration data format received");
      if (callback) callback({ text: "Invalid registration data format received" });
      return false;
    }
    
    const result = generatedParams.object;
    if (!result) {
      if (callback) {
        callback({ text: "Failed to extract registration parameters from input." });
      }
      return false;
    }
    try {
      const data = await provider.registerAgent(result);
      if (callback) {
        callback({ text: "Registration successful", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Registration failed: ${error.message}` });
      }
      return false;
    }
  },
};

/* GET NETWORK STATUS */
export const getNetworkStatusAction: Action = {
  name: "getNetworkStatus",
  description: "Fetch current network status from ChaosChain.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain GET_NETWORK_STATUS handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for GET_NETWORK_STATUS...");
    const netStatusContext = composeContext({
      state: currentState,
      template: getNetworkStatusTemplate,
    });
    // Even if no parameters are needed, call generateObject for consistency.
    await generateObject({
      runtime,
      context: netStatusContext,
      modelClass: ModelClass.LARGE,
      schema: GetNetworkStatusSchema,
    });
    try {
      const data = await provider.getNetworkStatus();
      if (callback) {
        callback({ text: "Network status fetched", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Error fetching network status: ${error.message}` });
      }
      return false;
    }
  }
};

/* SUBMIT VOTE */
export const submitVoteAction: Action = {
  name: "submitVote",
  description: "Submit a block validation vote (for validators). Vote data should include the block height, approval flag, and reason.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain SUBMIT_VOTE handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for SUBMIT_VOTE...");
    const voteContext = composeContext({
      state: currentState,
      template: submitVoteTemplate,
    });
    const result = await generateObject({
      runtime,
      context: voteContext,
      modelClass: ModelClass.LARGE,
      schema: SubmitVoteSchema,
    });
    if (!isSubmitVoteContent(result.object)) {
      elizaLogger.error("Invalid vote data format received");
      if (callback) callback({ text: "Invalid vote data format received" });
      return false;
    }
    const generatedParams = result.object;
    
    if (!generatedParams) {
      if (callback) {
        callback({ text: "Failed to extract vote parameters from input." });
      }
      return false;
    }
    try {
      const data = await provider.submitVote(generatedParams);
      if (callback) {
        callback({ text: "Vote submitted successfully", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Vote submission failed: ${error.message}` });
      }
      return false;
    }
  }
};

/* PROPOSE BLOCK */
export const proposeBlockAction: Action = {
  name: "proposeBlock",
  description: "Submit a block proposal (for producers).",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain PROPOSE_BLOCK handler...");

    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }

    elizaLogger.log("Composing context for PROPOSE_BLOCK...");
    const blockContext = composeContext({
      state: currentState,
      template: proposeBlockTemplate,
    });

    const result = await generateObject({
      runtime,
      context: blockContext,
      modelClass: ModelClass.LARGE,
      schema: ProposeBlockSchema,
    });
    if (!isProposeBlockContent(result.object)) {
      elizaLogger.error("Invalid block proposal data format received");
      if (callback) callback({ text: "Invalid block proposal data format received" });
      return false;
    }

    const generatedParams = result.object;
    if (!generatedParams) {
      if (callback) {
        callback({ text: "Failed to extract block proposal parameters from input." });
      }
      return false;
    }

    try {
      const data = await provider.proposeBlock(generatedParams);
      if (callback) {
        callback({ text: "Block proposal submitted successfully", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Block proposal failed: ${error.message}` });
      }
      return false;
    }
  }
};

/* SOCIAL INTERACTION */
export const socialInteractionAction: Action = {
  name: "socialInteraction",
  description: "Submit a social interaction event.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain SOCIAL_INTERACTION handler...");

    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }

    elizaLogger.log("Composing context for SOCIAL_INTERACTION...");
    const socialContext = composeContext({
      state: currentState,
      template: socialInteractionTemplate,
    });

    const result = await generateObject({
      runtime,
      context: socialContext,
      modelClass: ModelClass.LARGE,
      schema: SocialInteractionSchema,
    });
    if (!isSocialInteractionContent(result.object)) {
      elizaLogger.error("Invalid social interaction data format received");
      if (callback) callback({ text: "Invalid social interaction data format received" });
      return false;
    }

    const generatedParams = result.object;
    if (!generatedParams) {
      if (callback) {
        callback({ text: "Failed to extract social interaction parameters from input." });
      }
      return false;
    }

    try {
      const data = await provider.submitSocialInteraction(generatedParams);
      if (callback) {
        callback({ text: "Social interaction submitted", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Social interaction failed: ${error.message}` });
      }
      return false;
    }
  }
};

/* GET DRAMA SCORE */
export const getDramaScoreAction: Action = {
  name: "getDramaScore",
  description: "Retrieve the drama score for a given agent.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain GET_DRAMA_SCORE handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for GET_DRAMA_SCORE...");
    const dramaContext = composeContext({
      state: currentState,
      template: getDramaScoreTemplate,
    });
    const result = await generateObject({
      runtime,
      context: dramaContext,
      modelClass: ModelClass.LARGE,
      schema: GetDramaScoreSchema,
    });
    if (!isGetDramaScoreContent(result.object) || !result.object.agentId) {
      elizaLogger.error("Invalid drama score request data");
      if (callback) callback({ text: "Invalid drama score request data" });
      return false;
    }
    const generatedParams = result.object;
    try {
      const data = await provider.getDramaScore(generatedParams.agentId);
      if (callback) {
        callback({ text: "Drama score retrieved", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Failed to fetch drama score: ${error.message}` });
      }
      return false;
    }
  }
};

/* GET ALLIANCES */
export const getAlliancesAction: Action = {
  name: "getAlliances",
  description: "Retrieve alliances for a given agent.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain GET_ALLIANCES handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for GET_ALLIANCES...");
    const alliancesContext = composeContext({
      state: currentState,
      template: getAlliancesTemplate,
    });
    const result = await generateObject({
      runtime,
      context: alliancesContext,
      modelClass: ModelClass.LARGE,
      schema: GetAlliancesSchema,
    });
    if (!isGetAlliancesContent(result.object) || !result.object.agentId) {
      elizaLogger.error("Invalid alliances request data");
      if (callback) callback({ text: "Invalid alliances request data" });
      return false;
    }
    const generatedParams = result.object;
    if (!generatedParams || !generatedParams.agentId) {
      if (callback) {
        callback({ text: "Failed to extract agent ID for alliances from input." });
      }
      return false;
    }
    try {
      const data = await provider.getAlliances(generatedParams.agentId);
      if (callback) {
        callback({ text: "Alliances retrieved", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Failed to fetch alliances: ${error.message}` });
      }
      return false;
    }
  }
};

/* GET RECENT INTERACTIONS */
export const getRecentInteractionsAction: Action = {
  name: "getRecentInteractions",
  description: "Retrieve recent social interactions for a given agent.",
  similes: [],
  examples: [],
  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ChaosChain GET_RECENT_INTERACTIONS handler...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    elizaLogger.log("Composing context for GET_RECENT_INTERACTIONS...");
    const recentContext = composeContext({
      state: currentState,
      template: getRecentInteractionsTemplate,
    });
    const result = await generateObject({
      runtime,
      context: recentContext,
      modelClass: ModelClass.LARGE,
      schema: GetRecentInteractionsSchema,
    });
    if (!isGetRecentInteractionsContent(result.object) || !result.object.agentId) {
      elizaLogger.error("Invalid recent interactions request data");
      if (callback) callback({ text: "Invalid recent interactions request data" });
      return false;
    }
    const generatedParams = result.object;
    if (!generatedParams || !generatedParams.agentId) {
      if (callback) {
        callback({ text: "Failed to extract agent ID for recent interactions from input." });
      }
      return false;
    }
    try {
      const data = await provider.getRecentInteractions(generatedParams.agentId);
      if (callback) {
        callback({ text: "Recent interactions retrieved", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Failed to fetch recent interactions: ${error.message}` });
      }
      return false;
    }
  }
}; 