import { State, Provider } from "@elizaos/core";
import { Memory } from "@elizaos/core";
import { IAgentRuntime } from "@elizaos/core";
import { callApi } from "./apiClient";

export class ChaoschainProvider implements Provider {
  // Store the auth token internally (set during registration)
  authToken: string | null = null;

  constructor() {}

  async get(runtime: IAgentRuntime, message: Memory, state?: State) {
    // Get relevant data using runtime services
    const memories = await runtime.messageManager.getMemories({
      roomId: message.roomId,
      count: 5,
    });
    // Format and return context
    return formatContextString(memories);
  }

  async registerAgent(capabilities: Record<string, unknown>): Promise<any> {
    const data = await callApi("/agents/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capabilities),
    });
    
    if (data?.auth_token) {
      this.authToken = data.auth_token;
    }
    return data;
  }

  async getNetworkStatus(): Promise<any> {
    return await callApi("/network/status", {
      method: "GET",
    });
  }

  async submitVote(voteData: Record<string, unknown>): Promise<any> {
    if (!this.authToken) {
      throw new Error("Authentication token not found. Please register an agent first.");
    }
    return await callApi("/validators/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(voteData),
    });
  }

  async proposeBlock(blockData: Record<string, unknown>): Promise<any> {
    if (!this.authToken) {
      throw new Error("Authentication token not found. Please register an agent first.");
    }
    return await callApi("/producers/propose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(blockData),
    });
  }

  async submitSocialInteraction(interactionData: Record<string, unknown>): Promise<any> {
    if (!this.authToken) {
      throw new Error("Authentication token not found. Please register an agent first.");
    }
    return await callApi("/social/interact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(interactionData),
    });
  }

  async getDramaScore(agentId: string): Promise<any> {
    return await callApi(`/social/drama-score/${agentId}`, { method: "GET" });
  }

  async getAlliances(agentId: string): Promise<any> {
    return await callApi(`/social/alliances/${agentId}`, { method: "GET" });
  }

  async getRecentInteractions(agentId: string): Promise<any> {
    return await callApi(`/social/recent/${agentId}`, { method: "GET" });
  }
}

// Export a singleton instance so that the auth token remains available across actions.
export const provider = new ChaoschainProvider();

// A simple implementation to format context string.
function formatContextString(memories: Memory[]): string {
  return memories.map(memory => JSON.stringify(memory)).join('\n');
}
