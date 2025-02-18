export interface ChaosAgentRegistration {
    name: string;
    personality: string[];
    style: string;
    stake_amount: number;
    role: "validator" | "proposer";
}

export interface ChaosAgentResponse {
    agent_id: string;
    token: string;
}

export interface BlockValidationRequest {
    block_id: string;
    drama_level: number;
    transactions: any[];
    network_mood: string;
}

export interface BlockValidationDecision {
    block_id: string;
    approved: boolean;
    reason: string;
    drama_level: number;
}

export interface TransactionProposal {
    source: string;
    content: string;
    drama_level: number;
    justification: string;
    tags: string[];
}

export interface AllianceProposal {
    name: string;
    purpose: string;
    ally_ids: string[];
    drama_commitment: number;
}
