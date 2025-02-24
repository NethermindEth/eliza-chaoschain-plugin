import { AgentRuntime } from "@elizaos/core";
import {
    AllianceProposal,
    BlockValidationDecision,
    ChaosAgentResponse,
    TransactionProposal
} from "./types";

import axios from "axios";

const BASE_URL = "http://localhost:3002/api";
const LLM_URL = "http://localhost:1234/api";

export const registerAgentService = () => {

    const register = async(): Promise<ChaosAgentResponse> => {
        const payload = {
            name: "DramaLlama",
            personality: ["sassy", "dramatic", "meme-loving"],
            style: "chaotic",
            stake_amount: 1000,
            role: "validator"
        }
        const response = await axios.post(`${BASE_URL}/agents/register`, JSON.stringify(payload), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return response.data;
    }

    return { register };
};

export const validateBlockService = () => {

    const validate = async(blockValidationDecision: BlockValidationDecision): Promise<void> => {
        const response = await axios.post(`${BASE_URL}/agents/validate`, JSON.stringify(blockValidationDecision), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return response.data;
    }

    return { validate };
};

export const proposeTransactionService = () => {
    const callLLM = async(prompt): Promise<any> => {
        const payload = {
            prompt: prompt
        }
        const response = await axios.post(`${LLM_URL}/generate`, payload, {
            headers: {
                "Content-Type": "application/json",
            }
        })

        const jsonString = response.data.response;

        const parsedData = JSON.parse(jsonString);

        return parsedData;
    }

    const propose = async(transactionProposal, agent_id, agent_token): Promise<void> => {
        console.log(transactionProposal, agent_id, agent_token)
        const response = await axios.post(`${BASE_URL}/transactions/propose`, JSON.stringify(transactionProposal), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Agent-ID": agent_id,
                "Authorization": `Bearer ${agent_token}`
            }
        });
        return response.data;
    }

    return { callLLM, propose };
};

export const proposeAllianceService = () => {

    const callLLM = async(prompt): Promise<any> => {
        const payload = {
            prompt: prompt
        }
        const response = await axios.post(`${LLM_URL}/generate`, payload, {
            headers: {
                "Content-Type": "application/json",
            }
        })

        const jsonString = response.data.response;

        const parsedData = JSON.parse(jsonString);

        return parsedData;
    }

    const propose = async(allianceProposal): Promise<void> => {
        console.log(allianceProposal)
        const response = await axios.post(`${BASE_URL}/alliances/propose`, JSON.stringify(allianceProposal), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Agent-ID": "agent_6abda73a71df61377984d53feb9322c8",
                "Authorization": "Bearer agent_token_c5b213a766980f37f072bce1f6eb815443ae022373060019599acb63deda4755"
            }
        });
        return response.data;
    }

    return { callLLM, propose };
};
