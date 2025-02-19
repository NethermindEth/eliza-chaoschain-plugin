import { State, Provider } from "@elizaos/core";
import { Memory } from "@elizaos/core";
import { IAgentRuntime } from "@elizaos/core";
import { callApi } from "./apiClient";

export class ChaoschainProvider implements Provider {
  // Store the auth token internally (set during registration)
  authToken: string | null = null;
  agentId: string | null = null;

  constructor() {}

  async get(runtime: IAgentRuntime, message: Memory, state?: State) {
    const memories = await runtime.messageManager.getMemories({
      roomId: message.roomId,
      count: 5,
    });
    return formatContextString(memories);
  }

  async registerAgent(capabilities: Record<string, unknown>): Promise<any> {
    const data = await callApi("/agents/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capabilities),
    });

    if (data?.token) {
      this.authToken = data.token;
      this.agentId = data.agent_id;
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
      throw new Error(
        "Authentication token not found. Please register an agent first."
      );
    }
    return await callApi("/agents/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        "X-Agent-ID": this.agentId || "",
      },
      body: JSON.stringify(voteData),
    });
  }

  async proposeBlock(blockData: Record<string, unknown>): Promise<any> {
    if (!this.authToken) {
      throw new Error(
        "Authentication token not found. Please register an agent first."
      );
    }
    return await callApi("/transactions/propose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        "X-Agent-ID": this.agentId || "",
      },
      body: JSON.stringify(blockData),
    });
  }

  async getAgentStatus(): Promise<any> {
    return await callApi(`/agents/status/${this.agentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
  }

  async proposeAlliance(
    proposeAllianceData: Record<string, unknown>
  ): Promise<any> {
    return await callApi("/alliances/propose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        "X-Agent-ID": this.agentId || "",
      },
      body: JSON.stringify(proposeAllianceData),
    });
  }
}

// Export a singleton instance so that the auth token remains available across actions.
export const provider = new ChaoschainProvider();

// A simple implementation to format context string.
function formatContextString(memories: Memory[]): string {
  return memories.map((memory) => JSON.stringify(memory)).join("\n");
}
