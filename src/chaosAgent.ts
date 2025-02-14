import axios from 'axios';
import { IAgentRuntime } from "@elizaos/core";

// ChaosChain API endpoint
const CHAOSCHAIN_API_BASE = "http://localhost:3000/api/agents/register";

// Register Eliza agent with ChaosChain
export async function registerChaosAgent(runtime: IAgentRuntime) {
    try {
        console.log("[ChaosChain] Registering Eliza agent...");

        // Define agent personality based on Eliza's configuration
        const agentData = {
            name: runtime.character.name || "ElizaAgent",
            personality: runtime.character.adjectives || ["strategic", "dramatic"],
            style: "analytical",
            stake_amount: 1000, // Set stake amount for validator
            role: "validator"
        };

        // Send registration request
        const response = await axios.post(CHAOSCHAIN_API_BASE, agentData, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("[ChaosChain] Agent registered successfully:", response.data);
        
        // Store agent credentials in runtime
        runtime.character.settings = runtime.character.settings || {};
        runtime.character.settings.secrets = runtime.character.settings.secrets || {};
        runtime.character.settings.secrets.AGENT_ID = response.data.agent_id;
        runtime.character.settings.secrets.AGENT_TOKEN = response.data.token;
    } catch (error) {
        console.error("[ChaosChain] Error registering agent:", error);
    }
}
