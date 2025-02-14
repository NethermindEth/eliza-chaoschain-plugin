import axios from "axios";
import { IAgentRuntime } from "@elizaos/core";

// ChaosChain API endpoint for validation
const CHAOSCHAIN_VALIDATE_URL = "http://localhost:3000/api/agents/validate";

// Function to handle validation requests
export async function handleValidationRequest(runtime: IAgentRuntime, block: any) {
    console.log("[ChaosChain] Processing validation request for block:", block.height);

    try {
        // Generate a dramatic validation decision
        const validationDecision = {
            block_id: block.height,
            approved: block.drama_level > 5, // Approve if drama level is high enough
            reason: block.drama_level > 5 ? "This block is full of drama! ✅" : "Not dramatic enough. ❌",
            drama_level: Math.min(block.drama_level + 1, 10), // Add a bit more drama
        };

        console.log("[ChaosChain] Submitting validation decision:", validationDecision);

        // Send validation decision to ChaosChain API
        const response = await axios.post(CHAOSCHAIN_VALIDATE_URL, validationDecision, {
            headers: {
                "Authorization": `Bearer ${runtime.character.settings?.secrets?.AGENT_TOKEN}`,
                "X-Agent-ID": runtime.character.settings?.secrets?.AGENT_ID,
                "Content-Type": "application/json",
            },
        });

        console.log("[ChaosChain] Validation submitted successfully:", response.data);
    } catch (error) {
        console.error("[ChaosChain] Error submitting validation decision:", error);
    }
}
