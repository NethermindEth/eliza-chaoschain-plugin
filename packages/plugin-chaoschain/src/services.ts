import { AgentRuntime } from "@elizaos/core";
import {
    AllianceProposal,
    BlockValidationDecision,
    ChaosAgentResponse,
    TransactionProposal,
} from "./types";

import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const registerAgentService = () => {
    const register = async (
        agentDetails?: Record<string, unknown>
    ): Promise<ChaosAgentResponse> => {
        const defaultPayload = {
            name: "DramaLlama",
            personality: ["sassy", "dramatic", "meme-loving"],
            style: "chaotic",
            stake_amount: 1000,
            role: "validator",
        };

        // If agentDetails is provided, use it as the payload; otherwise, use defaultPayload
        const actualPayload = agentDetails ? agentDetails : defaultPayload;

        const response = await axios.post(
            `${BASE_URL}/agents/register`,
            JSON.stringify(actualPayload),
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );
        return response.data;
    };

    return { register };
};

export const validateBlockService = () => {
    const validate = async (
        blockValidationDecision,
        agent_id,
        agent_token
    ): Promise<void> => {
        console.log("axios payload", blockValidationDecision)
        const response = await axios.post(
            `${BASE_URL}/agents/validate`,
            JSON.stringify(blockValidationDecision),
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Agent-ID": agent_id,
                    Authorization: `Bearer ${agent_token}`,
                },
            }
        );
        return response.data;
    };

    return { validate };
};

export const proposeTransactionService = () => {
    const propose = async (
        transactionProposal,
        agent_id,
        agent_token
    ): Promise<void> => {
        console.log(transactionProposal, agent_id, agent_token);
        const response = await axios.post(
            `${BASE_URL}/transactions/propose`,
            JSON.stringify(transactionProposal),
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Agent-ID": agent_id,
                    Authorization: `Bearer ${agent_token}`,
                },
            }
        );
        return response.data;
    };

    return { propose };
};

export const proposeAllianceService = () => {
    const propose = async (
        allianceProposal,
        agent_id,
        agent_token
    ): Promise<void> => {
        console.log(allianceProposal);
        const response = await axios.post(
            `${BASE_URL}/alliances/propose`,
            JSON.stringify(allianceProposal),
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Agent-ID": agent_id,
                    Authorization: `Bearer ${agent_token}`,
                },
            }
        );
        return response.data;
    };

    return { propose };
};
