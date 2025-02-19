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
  BlockValidationSchema,
  ProposeBlockSchema,
  SocialInteractionSchema,
  GetDramaScoreSchema,
  GetAlliancesSchema,
  GetRecentInteractionsSchema,
  AllianceProposalSchema,
} from "./schemas";

import {
  registerChaosAgentTemplate,
  getNetworkStatusTemplate,
  blockValidationTemplate,
  proposeBlockTemplate,
  socialInteractionTemplate,
  getDramaScoreTemplate,
  getAlliancesTemplate,
  getRecentInteractionsTemplate,
  proposeAllianceTemplate,
  getBlockDataTemplate,
} from "./templates";
import { z } from "zod";
import { generateValidationDecision } from "./chaosLogic";

export type RegisterAgentContent = z.infer<typeof RegisterAgentSchema> &
  Content;
export const isRegisterAgentContent = (
  obj: unknown
): obj is RegisterAgentContent => {
  return RegisterAgentSchema.safeParse(obj).success;
};

export type GetNetworkStatusContent = z.infer<typeof GetNetworkStatusSchema> &
  Content;
export const isGetNetworkStatusContent = (
  obj: unknown
): obj is GetNetworkStatusContent => {
  return GetNetworkStatusSchema.safeParse(obj).success;
};

export type SubmitVoteContent = z.infer<typeof BlockValidationSchema> & Content;
export const isSubmitVoteContent = (obj: unknown): obj is SubmitVoteContent => {
  return BlockValidationSchema.safeParse(obj).success;
};

export type ProposeBlockContent = z.infer<typeof ProposeBlockSchema> & Content;
export const isProposeBlockContent = (
  obj: unknown
): obj is ProposeBlockContent => {
  return ProposeBlockSchema.safeParse(obj).success;
};

export type SocialInteractionContent = z.infer<typeof SocialInteractionSchema> &
  Content;
export const isSocialInteractionContent = (
  obj: unknown
): obj is SocialInteractionContent => {
  return SocialInteractionSchema.safeParse(obj).success;
};

export type GetDramaScoreContent = z.infer<typeof GetDramaScoreSchema> &
  Content;
export const isGetDramaScoreContent = (
  obj: unknown
): obj is GetDramaScoreContent => {
  return GetDramaScoreSchema.safeParse(obj).success;
};

export type GetAlliancesContent = z.infer<typeof GetAlliancesSchema> & Content;
export const isGetAlliancesContent = (
  obj: unknown
): obj is GetAlliancesContent => {
  return GetAlliancesSchema.safeParse(obj).success;
};

export type GetRecentInteractionsContent = z.infer<
  typeof GetRecentInteractionsSchema
> &
  Content;
export const isGetRecentInteractionsContent = (
  obj: unknown
): obj is GetRecentInteractionsContent => {
  return GetRecentInteractionsSchema.safeParse(obj).success;
};

export type AllianceProposalContent = z.infer<typeof AllianceProposalSchema> &
  Content;
export const isAllianceProposalContent = (
  obj: unknown
): obj is AllianceProposalContent => {
  return AllianceProposalSchema.safeParse(obj).success;
};

/* REGISTER CHAOS AGENT */
export const registerChaosAgentAction: Action = {
  name: "registerChaosAgent",
  description:
    "Register a new agent with ChaosChain. This call will store the authentication token for subsequent requests.",
  similes: [
    "Create a new agent",
    "Register a new agent",
    "Enroll a new agent",
    "Sign up for a new agent",
  ],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Register agent with name 'Pizza', personality ['dramatic', 'witty'], style 'sarcastic', stake_amount 1000, role 'validator'",
          action: "REGISTER_AGENT",
        },
      },
      {
        user: "{{user2}}",
        content: {
          text: "Agent 'Pizza' has registered successfully with token '1234567890' and agent ID '1234567890'",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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
      if (callback)
        callback({ text: "Invalid registration data format received" });
      return false;
    }

    const result = generatedParams.object;
    try {
      const data = await provider.registerAgent(result);
      if (callback) {
        callback({
          text:
            "Agent has been registered successfully. Here are the details:\n" +
            `Token: ${data.token}\n` +
            `Agent ID: ${data.agent_id}`,
          content: data,
        });
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
  similes: [
    "Check the status of the network",
    "Get the current network status",
  ],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get current network status",
          action: "GET_NETWORK_STATUS",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }

    const netStatusContext = composeContext({
      state: currentState,
      template: getNetworkStatusTemplate,
    });

    await generateObject({
      runtime,
      context: netStatusContext,
      modelClass: ModelClass.LARGE,
      schema: GetNetworkStatusSchema,
    });

    try {
      const data = await provider.getNetworkStatus();
      if (callback) {
        callback({ text: `Network status fetched: ${data}`, content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Error fetching network status: ${error.message}` });
      }
      return false;
    }
  },
};

/* SUBMIT VOTE */
export const submitVoteAction: Action = {
  name: "submitVote",
  description:
    "Submit a block validation vote (for validators). Vote data should include the block height, approval flag, and reason.",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Submit vote with block_height 150, approved true, reason 'Block is valid'",
          action: "SUBMIT_VOTE",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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
      if (callback) callback({ text: "Invalid vote data format received" });
      return false;
    }
    const generatedParams = result.object;

    try {
      const data = await provider.submitVote(generatedParams);
      if (callback) {
        callback({
          text: `Vote submitted successfully: ${JSON.stringify(data)}`,
          content: data,
        });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Vote submission failed: ${error.message}` });
      }
      return false;
    }
  },
};

/* PROPOSE BLOCK */
export const proposeBlockAction: Action = {
  name: "proposeBlock",
  description: "Submit a block proposal (for producers).",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Propose a block with blockData {'transactions': ['tx1','tx2']}",
          action: "PROPOSE_BLOCK",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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
      if (callback)
        callback({ text: "Invalid block proposal data format received" });
      return false;
    }

    const generatedParams = result.object;

    try {
      const data = await provider.proposeBlock(generatedParams);
      if (callback) {
        callback({
          text: "Block proposal submitted successfully",
          content: data,
        });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({ text: `Block proposal failed: ${error.message}` });
      }
      return false;
    }
  },
};

/* GET AGENT STATUS */
export const getAgentStatusAction: Action = {
  name: "getAgentStatus",
  description: "Retrieve agent status including drama score and validations.",
  similes: ["Get agent info", "Fetch my agent status", "Retrieve agent status"],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "What's my agent status?",
          action: "GET_AGENT_STATUS",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options: Record<string, unknown> | undefined,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting GET_AGENT_STATUS handler...");

    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }

    try {
      const data = await provider.getAgentStatus();
      if (callback) {
        callback({ text: "Agent status fetched.", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback)
        callback({ text: `Error fetching agent status: ${error.message}` });
      return false;
    }
  },
};

/* PROPOSE ALLIANCE */
export const proposeAllianceAction: Action = {
  name: "proposeAlliance",
  description: "Propose an alliance between agents in the ChaosChain network.",
  similes: ["Propose alliance", "Form an alliance", "Alliance proposal"],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Propose an alliance with agents ['agent_a', 'agent_b'] named 'Chaos Alliance' with drama commitment 8",
          action: "PROPOSE_ALLIANCE",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options: Record<string, unknown> | undefined,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting PROPOSE_ALLIANCE handler...");

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

    const proposal = result.object;
    try {
      const data = await provider.proposeAlliance(proposal);
      if (callback) {
        callback({
          text: "Alliance proposal submitted successfully",
          content: data,
        });
      }
      return true;
    } catch (error: any) {
      if (callback)
        callback({ text: `Alliance proposal failed: ${error.message}` });
      return false;
    }
  },
};

/* SOCIAL INTERACTION */
export const socialInteractionAction: Action = {
  name: "socialInteraction",
  description: "Submit a social interaction event.",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Submit social interaction: agent liked a post",
          action: "SOCIAL_INTERACTION",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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
      if (callback)
        callback({ text: "Invalid social interaction data format received" });
      return false;
    }

    const generatedParams = result.object;

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
  },
};

/* GET DRAMA SCORE */
export const getDramaScoreAction: Action = {
  name: "getDramaScore",
  description: "Retrieve the drama score for a given agent.",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get drama score for agent ID 'agent123'",
          action: "GET_DRAMA_SCORE",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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

    try {
      const data = await provider.getDramaScore();
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
  },
};

/* GET ALLIANCES */
export const getAlliancesAction: Action = {
  name: "getAlliances",
  description: "Retrieve alliances for a given agent.",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Retrieve alliances for agent ID 'agent456'",
          action: "GET_ALLIANCES",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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

    try {
      const data = await provider.getAlliances();
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
  },
};

/* GET RECENT INTERACTIONS */
export const getRecentInteractionsAction: Action = {
  name: "getRecentInteractions",
  description: "Retrieve recent social interactions for a given agent.",
  similes: [],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show recent interactions for agent ID 'agent789'",
          action: "GET_RECENT_INTERACTIONS",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory
  ): Promise<boolean> => {
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

    try {
      const data = await provider.getRecentInteractions();
      if (callback) {
        callback({ text: "Recent interactions retrieved", content: data });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({
          text: `Failed to fetch recent interactions: ${error.message}`,
        });
      }
      return false;
    }
  },
};
