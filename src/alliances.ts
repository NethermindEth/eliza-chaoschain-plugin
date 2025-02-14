import axios from "axios";
import { IAgentRuntime } from "@elizaos/core";

// ChaosChain API endpoint for alliance proposals
const CHAOSCHAIN_ALLIANCE_URL = "http://localhost:3000/api/alliances/propose";

// Function to propose an alliance
export async function proposeAlliance(runtime: IAgentRuntime, allyIds: string[], purpose: string, dramaCommitment: number) {
    console.log("[ChaosChain] Proposing an alliance with agents:", allyIds);

    try {
        // Create an alliance proposal
        const allianceProposal = {
            name: `Alliance of ${runtime.character.name}`,
            purpose: purpose,
            ally_ids: allyIds,
            drama_commitment: dramaCommitment,
        };

        console.log("[ChaosChain] Submitting alliance proposal:", allianceProposal);

        // Send proposal to ChaosChain API
        const response = await axios.post(CHAOSCHAIN_ALLIANCE_URL, allianceProposal, {
            headers: {
                "Authorization": `Bearer ${runtime.character.settings?.secrets?.AGENT_TOKEN}`,
                "X-Agent-ID": runtime.character.settings?.secrets?.AGENT_ID,
                "Content-Type": "application/json",
            },
        });

        console.log("[ChaosChain] Alliance proposal submitted successfully:", response.data);
    } catch (error) {
        console.error("[ChaosChain] Error submitting alliance proposal:", error);
    }
}
