// chaoschain-plugin/services.ts

import axios from "axios";
import {
    ChaosAgentRegistration,
    ChaosAgentResponse,
    BlockValidationRequest,
    BlockValidationDecision,
    TransactionProposal,
    AllianceProposal
} from "./types";

const CHAOSCHAIN_API_BASE = "http://localhost:3000/api";

export const ChaosChainService = {
    async registerAgent(agentData: ChaosAgentRegistration): Promise<ChaosAgentResponse> {
        const response = await axios.post(`${CHAOSCHAIN_API_BASE}/agents/register`, agentData);
        return response.data;
    },

    async validateBlock(validationDecision: BlockValidationDecision): Promise<void> {
        await axios.post(`${CHAOSCHAIN_API_BASE}/agents/validate`, validationDecision);
    },

    async proposeTransaction(transaction: TransactionProposal): Promise<void> {
        await axios.post(`${CHAOSCHAIN_API_BASE}/transactions/propose`, transaction);
    },

    async proposeAlliance(alliance: AllianceProposal): Promise<void> {
        await axios.post(`${CHAOSCHAIN_API_BASE}/alliances/propose`, alliance);
    }
};
