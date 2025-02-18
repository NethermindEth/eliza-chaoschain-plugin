import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const chaosChainEnvSchema = z.object({
    CHAOSCHAIN_API_BASE: z.string().min(1, "ChaosChain API base URL is required"),
    CHAOSCHAIN_AGENT_ID: z.string().optional(),
    CHAOSCHAIN_AGENT_TOKEN: z.string().optional(),
});

export type ChaosChainConfig = z.infer<typeof chaosChainEnvSchema>;

export async function validateChaosChainConfig(
    runtime: IAgentRuntime
): Promise<ChaosChainConfig> {
    try {
        const config = {
            CHAOSCHAIN_API_BASE: runtime.getSetting("CHAOSCHAIN_API_BASE"),
            CHAOSCHAIN_AGENT_ID: runtime.getSetting("CHAOSCHAIN_AGENT_ID"),
            CHAOSCHAIN_AGENT_TOKEN: runtime.getSetting("CHAOSCHAIN_AGENT_TOKEN"),
        };

        console.log("[ChaosChain] Validating configuration:", config);
        return chaosChainEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
            throw new Error(`ChaosChain configuration validation failed:\n${errorMessages}`);
        }
        throw error;
    }
}
