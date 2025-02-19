import { type Client, Content, HandlerCallback, type IAgentRuntime, Memory, ModelClass, elizaLogger } from "@elizaos/core";
import { composeContext, embed } from "@elizaos/core";
import { generateMessageResponse } from "@elizaos/core";
import { messageCompletionFooter } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { WebsocketManager } from "./websocketManager";

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Direct client does not support stopping yet");
    },
};


const baseTemplate = `You are a ChaosChain validation agent responsible for processing routine autonomous messages.

Event Details:
{EVENT_DETAILS}

Additional facts learned:
{ADDITIONAL_FACTS}

Proceed with the regular autonomous workflow.
` + messageCompletionFooter;

export class AutoClient {

    private runtime: IAgentRuntime;
    private wsManager!: WebsocketManager;
    private pendingEvents: any[] = [];

    private baseUrl = process.env.BASE_URL;
    private agentId = process.env.AGENT_ID;
    private agentToken = process.env.AGENT_TOKEN;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        console.log("AutoClient constructor", 'autoclient');

        // Immediately register the agent if no token is present.
 
        console.log("No token found. Registering agent with payload:");
        elizaLogger.info("No token found. Registering agent with payload:");
        this.registerAgent().then(() => {
            elizaLogger.info("WebSocket initialized");
            this.initWebSocket();
            
        });
        

        // Set up periodic autonomous actions (every 10 seconds).
        setInterval(() => {
            console.log("AutoClient step");
            this.step();
        }, 10000);
        
        // Set up an interval to process pending WebSocket events (every 5 seconds).
        setInterval(() => {
            console.log("AutoClient processing pending events");
            this.processPendingEvents();
        }, 5000);
    }

    /**
     * Registers a new agent immediately and generates a registration response.
     * Upon success, the runtime token is updated.
     */
    private async registerAgent(): Promise<void> {
        const registrationPayload = {
            name: "Random",
            personality: ["dramatic", "chaotic", "witty"],
            style: "sarcastic",
            stake_amount: 1000,
            role: "validator"
        };
        const roomId = stringToUuid("registration-" + this.runtime.character.name);
        const registrationMessage: Memory = {
            userId: this.runtime.agentId,
            agentId: this.runtime.agentId,
            roomId,
            content: { text: `REGISTER_AGENT: ${JSON.stringify(registrationPayload)}` }
        };
        console.log("No token found. Registering agent with payload:", registrationPayload);
        await this.runtime.messageManager.createMemory(registrationMessage);

        // Compose state for registration.
        const state = await this.runtime.composeState(registrationMessage);
        const registrationTemplate = `Your task is to request another agent to register an chaoschain agent with the following payload.

Registration Payload:
${JSON.stringify(registrationPayload, null, 2)}

` + messageCompletionFooter;
        const context = composeContext({ state, template: registrationTemplate });
        const response = await generateMessageResponse({ runtime: this.runtime, context, modelClass: ModelClass.SMALL });
        const responseMessage: Memory = { ...registrationMessage, content: response };
        await this.runtime.messageManager.createMemory(responseMessage);
        await this.runtime.updateRecentMessageState(state);

        const callback: HandlerCallback = async (response: Content) => {
            console.log("Registration callback", response);
            return Promise.resolve([]);
        };
        await this.runtime.processActions(registrationMessage, [responseMessage], state, callback);

        // Simulate receiving a token after successful registration.
        if (!this.runtime.token) {
            this.runtime.token = "newly-registered-token";
            console.log("Agent registered successfully. New token assigned:", this.runtime.token);
        }
    }

    /**
     * Initializes and opens the WebSocket connection.
     */
    private initWebSocket(): void {
        const wsUrl = `${this.baseUrl}/api/ws?token=${this.agentToken}&agent_id=${this.agentId}&stake=1000`;
        this.wsManager = new WebsocketManager({ url: wsUrl });
        this.wsManager.connect();
        this.wsManager.on("message", async (event: any) => {
            console.log("AutoClient received WebSocket event:", event);
            if (event.type === "VALIDATION_REQUIRED") {
                this.pendingEvents.push(event);
            }
        });
        this.wsManager.on("error", (error: Error) => {
            console.error("WebSocket error in AutoClient:", error);
        });
    }

    async step(): Promise<void> {
        const roomId = stringToUuid("autonomous-" + this.runtime.character.name);
        const userId = this.runtime.agentId;
        const agentId = this.runtime.agentId;
        const message: Memory = { userId, agentId, roomId, content: { text: "" } };

        const messages = await this.runtime.messageManager.getMemories({ roomId, count: 2 });
        const text = messages.map(m => m.content.text).join("\n");
        const embedding = await embed(this.runtime, text);
        // const factsList = await this.runtime.factManager.searchMemoriesByEmbedding(
        //     embedding,
        //     { roomId, agentId, count: 10 }
        // );
        // const additionalFacts = factsList.length > 0 ? factsList.map(fact => fact?.content?.text).join("\n") : "None";
        const additionalFacts = "None";

        const state = await this.runtime.composeState(message, { additionalFacts });
        const context = composeContext({
            state,
            template: baseTemplate
                .replace("{EVENT_DETAILS}", "No event. Regular autonomous step.")
                .replace("{ADDITIONAL_FACTS}", additionalFacts)
        });

        const response = await generateMessageResponse({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.SMALL
        });
        const responseMessage: Memory = { ...message, content: response };
        await this.runtime.messageManager.createMemory(responseMessage);
        await this.runtime.updateRecentMessageState(state);

        const callback: HandlerCallback = async (response: Content) => {
            console.log("AutoClient callback", response);
            return Promise.resolve([]);
        };

        await this.runtime.processActions(message, [responseMessage], state, callback);
        await this.runtime.evaluate(message, state);
    }

    async processPendingEvents(): Promise<void> {
        while (this.pendingEvents.length > 0) {
            const event = this.pendingEvents.shift();
            await this.handleValidationRequired(event);
        }
    }

    async handleValidationRequired(event: any): Promise<void> {
        console.log("Handling VALIDATION_REQUIRED event in AutoClient:", event);
        const roomId = stringToUuid("validation-" + this.runtime.character.name);
        const message: Memory = {
            userId: this.runtime.agentId,
            agentId: this.runtime.agentId,
            roomId,
            content: { text: `Relay Event: ${JSON.stringify(event)}` }
        };

        const eventDetails = `Event Data: ${JSON.stringify(event)}`;
        const additionalFacts = "None";

        const relayTemplate = `You are a ChaosChain middleman relay agent. Your task is to pass along incoming WebSocket event data exactly as received for further processing by the system.

Event Details:
${eventDetails}

Additional Information:
${additionalFacts}

Produce a message that accurately relays the above event details without adding commentary.
` + messageCompletionFooter;

        const state = await this.runtime.composeState(message, { additionalFacts });
        const context = composeContext({ state, template: relayTemplate });
        const response = await generateMessageResponse({ runtime: this.runtime, context, modelClass: ModelClass.SMALL });
        const responseMessage: Memory = { ...message, content: response };
        await this.runtime.messageManager.createMemory(responseMessage);
        await this.runtime.updateRecentMessageState(state);

        const callback: HandlerCallback = async (response: Content) => {
            console.log("Relay message callback:", response);
            return Promise.resolve([]);
        };

        await this.runtime.processActions(message, [responseMessage], state, callback);
    }
}


export default AutoClientInterface;
