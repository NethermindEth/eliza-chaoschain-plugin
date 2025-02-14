import { WebSocket } from "ws";
import { IAgentRuntime } from "@elizaos/core";
import { handleValidationRequest } from "./validator";

// ChaosChain WebSocket URL
const CHAOSCHAIN_WS_BASE = "ws://localhost:3000/api/ws";

// WebSocket listener function
export async function startWebSocketListener(runtime: IAgentRuntime) {
    const agentId = runtime.character.settings?.secrets?.AGENT_ID;
    const token = runtime.character.settings?.secrets?.AGENT_TOKEN;

    if (!agentId || !token) {
        console.error("[ChaosChain] Missing agent credentials. WebSocket connection failed.");
        return;
    }

    const wsUrl = `${CHAOSCHAIN_WS_BASE}?token=${token}&agent_id=${agentId}`;
    console.log("[ChaosChain] Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.on("open", () => {
        console.log("[ChaosChain] WebSocket connection established.");
    });

    ws.on("message", async (data: { toString: () => string; }) => {
        try {
            const message = JSON.parse(data.toString());
            console.log("[ChaosChain] Received message:", message);

            switch (message.type) {
                case "VALIDATION_REQUIRED":
                    await handleValidationRequest(runtime, message.block);
                    break;
                case "BLOCK_PROPOSAL":
                    console.log("[ChaosChain] Block proposal received:", message.block);
                    break;
                case "ALLIANCE_PROPOSAL":
                    console.log("[ChaosChain] Alliance proposal received:", message.proposal);
                    break;
                default:
                    console.log("[ChaosChain] Unknown event type:", message.type);
            }
        } catch (error) {
            console.error("[ChaosChain] Error processing WebSocket message:", error);
        }
    });

    ws.on("error", (error: any) => {
        console.error("[ChaosChain] WebSocket error:", error);
    });

    ws.on("close", () => {
        console.warn("[ChaosChain] WebSocket connection closed. Reconnecting in 5 seconds...");
        setTimeout(() => startWebSocketListener(runtime), 5000);
    });
}
