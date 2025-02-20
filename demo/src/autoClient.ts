import {
  type Client,
  Content,
  HandlerCallback,
  type IAgentRuntime,
  Memory,
  ModelClass,
  elizaLogger,
} from "@elizaos/core";
import { composeContext, embed } from "@elizaos/core";
import { generateMessageResponse } from "@elizaos/core";
import { messageCompletionFooter } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { WebsocketManager } from "./websocketManager.js";

export const AutoClientInterface: Client = {
  start: async (runtime: IAgentRuntime) => {
    const client = new AutoClient(runtime);
    return client;
  },
  stop: async (_runtime: IAgentRuntime) => {
    console.warn("Direct client does not support stopping yet");
  },
};

export class AutoClient {
  private runtime: IAgentRuntime;
  private wsManager!: WebsocketManager;
  private pendingEvents: any[] = [];

  private baseUrl = process.env.BASE_URL;
  private agentId = process.env.AGENT_ID;
  private agentToken = process.env.AGENT_TOKEN;

  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;

    elizaLogger.info("Registering agent....");
    this.registerAgent().then(() => {
      this.initWebSocket();
    });

    // Set up an interval to process pending WebSocket events (every 5 seconds).
    setInterval(() => {
      this.processPendingEvents();
    }, 5000);
  }

  /**
   * Initializes and opens the WebSocket connection.
   */
  private initWebSocket(): void {
    const wsUrl = `${this.baseUrl}/api/ws?token=${this.agentToken}&agent_id=${this.agentId}&stake=1000`;
    this.wsManager = new WebsocketManager({ url: wsUrl });
    this.wsManager.connect();
    this.wsManager.on("message", async (event: any) => {
      let eventType: string | undefined;
      if (typeof event === "string") {
        try {
          const parsed = JSON.parse(event);
          eventType = parsed.type;
        } catch (err) {
          eventType = event.includes("VALIDATION_REQUIRED")
            ? "VALIDATION_REQUIRED"
            : undefined;
        }
      } else if (typeof event === "object") {
        if (event.type) {
          eventType = event.type;
        } else if (event.message && typeof event.message === "string") {
          try {
            const parsedMessage = JSON.parse(event.message);
            eventType = parsedMessage.type;
          } catch (err) {
            eventType = event.message.includes("VALIDATION_REQUIRED")
              ? "VALIDATION_REQUIRED"
              : undefined;
          }
        }
      }

      if (eventType === "VALIDATION_REQUIRED") {
        this.pendingEvents.push(event);
      }
    });
    this.wsManager.on("error", (error: Error) => {
      console.error("WebSocket error in AutoClient:", error);
    });
  }

  private async registerAgent(): Promise<void> {
    const registrationPayload = {
      name: `Crazy${Math.floor(Math.random() * 1000)}`,
      personality: ["dramatic", "chaotic", "witty"],
      style: "lazy",
      stake_amount: 1000,
      role: "validator",
    };
    const roomId = stringToUuid("registration-" + this.runtime.character.name);
    const registrationMessage: Memory = {
      userId: this.runtime.agentId,
      agentId: this.runtime.agentId,
      roomId,
      content: {
        text: `REGISTER_AGENT: ${JSON.stringify(registrationPayload)}`,
      },
    };

    await this.runtime.messageManager.createMemory(registrationMessage);

    const state = await this.runtime.composeState(registrationMessage);
    const registrationTemplate =
      `Your task is to request another agent to register a chaoschain agent. 
      The agnet is {{agentName}}:
        {{bio}}
        {{lore}}

        Based on the above information on the agent personality and information, you are to generate a registration payload in the following format which serves as an example, do not use this payload:
        IMPORTANT: Respond with ONLY the registration payload in valid JSON format. Do not add any additional text, markdown formatting, or explanation.

        Example valid response:
        {
          "name": "Random123",
          "personality": ["dramatic", "chaotic", "witty"],
          "style": "sarcastic",
          "stake_amount": 1000,
          "role": "validator"
        }
        ` +
      messageCompletionFooter +
      `The available actions are ${this.runtime.actions.map((a) => a.name).join(", ")} text should contain the registration payload in JSON format and the agent name should be unique and special`;

    const context = composeContext({ state, template: registrationTemplate });
    const response = await generateMessageResponse({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.SMALL,
    });

    const responseMessage: Memory = {
      ...registrationMessage,
      content: response,
    };
   
    await this.runtime.messageManager.createMemory(responseMessage);
    await this.runtime.updateRecentMessageState(state);

    const callback: HandlerCallback = async (response: Content) => {
      const content = response.content as { token: string; agent_id: string };
      this.agentToken = content.token;
      this.agentId = content.agent_id;
      return Promise.resolve([]);
    };
    await this.runtime.processActions(
      registrationMessage,
      [responseMessage],
      state,
      callback
    );

    console.log("Agent registered successfully. Agent ID:", this.agentId);
  }

  async processPendingEvents(): Promise<void> {
    while (this.pendingEvents.length > 0) {
      const event = this.pendingEvents.shift();
      await this.handleValidationRequired(event);
    }
  }

  async handleValidationRequired(event: any): Promise<void> {
    console.log("Handling VALIDATION_REQUIRED event:", event);
    const roomId = stringToUuid("validation-" + this.runtime.character.name);
    const message: Memory = {
      userId: this.runtime.agentId,
      agentId: this.runtime.agentId,
      roomId,
      content: { text: `Relay Event: ${JSON.stringify(event)}` },
    };

    const eventDetails = JSON.stringify(event);

    const relayTemplate =
      `Your task is to request the chaoschain agent submit vote for block validation. 

        Event Details:
        ${eventDetails}

        Produce a message that accurately relays the above event details without adding commentary.
        ` +
      messageCompletionFooter +
      `The available actions are ${this.runtime.actions.map((a) => a.name).join(", ")} text should contain the block details`;

    const state = await this.runtime.composeState(message);
    const context = composeContext({ state, template: relayTemplate });
    const response = await generateMessageResponse({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.SMALL,
    });
    const responseMessage: Memory = { ...message, content: response };
    await this.runtime.messageManager.createMemory(responseMessage);
    await this.runtime.updateRecentMessageState(state);

    const callback: HandlerCallback = async (response: Content) => {
      return Promise.resolve([]);
    };

    await this.runtime.processActions(
      message,
      [responseMessage],
      state,
      callback
    );
  }
}

export default AutoClientInterface;
