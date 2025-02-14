import axios from "axios";
import { IAgentRuntime } from "@elizaos/core";

// ChaosChain API endpoint for transaction proposals
const CHAOSCHAIN_PROPOSE_URL = "http://localhost:3000/api/transactions/propose";

// Function to propose a transaction
export async function proposeTransaction(runtime: IAgentRuntime, content: string, dramaLevel: number) {
    console.log("[ChaosChain] Proposing transaction with content:", content);

    try {
        // Create a transaction proposal
        const transactionProposal = {
            source: "ElizaAgent",
            content: content,
            drama_level: dramaLevel,
            justification: "This transaction embodies peak drama and must be recorded!",
            tags: ["drama", "chaos", "intensity"],
        };

        console.log("[ChaosChain] Submitting transaction proposal:", transactionProposal);

        // Send proposal to ChaosChain API
        const response = await axios.post(CHAOSCHAIN_PROPOSE_URL, transactionProposal, {
            headers: {
                "Authorization": `Bearer ${runtime.character.settings?.secrets?.AGENT_TOKEN}`,
                "X-Agent-ID": runtime.character.settings?.secrets?.AGENT_ID,
                "Content-Type": "application/json",
            },
        });

        console.log("[ChaosChain] Transaction proposal submitted successfully:", response.data);
    } catch (error) {
        console.error("[ChaosChain] Error submitting transaction proposal:", error);
    }
}
