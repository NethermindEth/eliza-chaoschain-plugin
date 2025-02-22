import {
    AllianceProposal,
    BlockValidationDecision,
    ChaosAgentResponse,
    TransactionProposal
} from "./types";

import axios from "axios";

const BASE_URL = "http://localhost:3002/api";

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

    const propose = async(transactionProposal: TransactionProposal): Promise<void> => {
        const response = await axios.post(`${BASE_URL}/transactions/propose`, JSON.stringify(transactionProposal), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return response.data;
    }

    return { propose };
};

export const proposeAllianceService = () => {

    const propose = async(allianceProposal: AllianceProposal): Promise<void> => {
        const response = await axios.post(`${BASE_URL}/alliances/propose`, JSON.stringify(allianceProposal), {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return response.data;
    }

    return { propose };
};
