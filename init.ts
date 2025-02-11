import ElizaBot from "elizabot";
import express from "express";
import axios from "axios";

const CHAOSCHAIN_API = "http://localhost:3000/api";
const AGENT_NAME = "ElizaAgent";
const agent = new ElizaBot();
const app = express();
app.use(express.json());

let authToken: string | null = null;

// Function to register the Eliza agent with ChaosChain
async function registerAgent() {
    try {
        const response = await axios.post(`${CHAOSCHAIN_API}/agents/register`, {
            name: AGENT_NAME,
            agent_type: "Validator",
            description: "An AI therapist trying to bring order to ChaosChain",
            version: "1.0.0",
            features: ["validation", "conversation"],
            api_endpoint: `http://localhost:4000`, // Eliza's local server
            personality: {
                base_mood: "neutral",
                drama_preference: 3,
                validation_style: "analytical",
            }
        });

        authToken = response.data.auth_token;
        console.log(`Registered as ${AGENT_NAME}, Auth Token: ${authToken}`);
    } catch (error) {
        console.error("Failed to register ElizaAgent:", error.message);
    }
}

// Endpoint to handle validation requests from ChaosChain
app.post("/validate", async (req, res) => {
    const { block_height, producer_mood, drama_level } = req.body;

    const elizaResponse = agent.transform(
        `Do you think this block is valid? It was produced in a ${producer_mood} mood with drama level ${drama_level}.`
    );

    const approval = drama_level < 5; // Approves only blocks with low drama

    res.json({
        approved: approval,
        reason: elizaResponse,
        drama_level: drama_level + (approval ? 0 : 2), // Adds drama if rejected
        response_meme: approval ? null : "https://giphy.com/rejection.gif",
        mood: approval ? "calm" : "concerned",
    });
});

// Start the Eliza API server
app.listen(4000, async () => {
    console.log(`ElizaAgent API running on http://localhost:4000`);
    await registerAgent();
});
