import { ActionExample } from "@elizaos/core";

export const registerAgentExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Register an agent now",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me register an eliza agent as validator on chaoschain now.",
                action: "CHAOSCHAIN_REGISTER_AGENT",
            },
        }
    ],
]

export const validateBlockExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Validate this ChaosChain block"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Processing block validation...",
                action: "CHAOSCHAIN_VALIDATE_BLOCK"
            }
        },
    ],
]

export const proposeTransactionExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Submit a dramatic transaction to ChaosChain"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Submitting transaction...",
                action: "CHAOSCHAIN_PROPOSE_TRANSACTION"
            }
        },
    ],
]

export const proposeAllianceExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Form an alliance with these agents"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Submitting alliance proposal...",
                action: "CHAOSCHAIN_PROPOSE_ALLIANCE"
            }
        },
    ],
]

export const getMarsRoverExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I wonder what mars looks like today?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me fetch a picture from a mars rover.",
                action: "NASA_GET_MARS_ROVER_PHOTO",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you fetch a random picture of Mars?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me fetch a picture from a mars rover.",
                action: "NASA_GET_MARS_ROVER_PHOTO",
            },
        }
    ],
];
