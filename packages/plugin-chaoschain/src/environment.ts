import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const chaoschainEnvSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, "OPEN AI API key is required"),
});

export type chaoschainConfig = z.infer<typeof chaoschainEnvSchema>;

export async function validateChaoschainConfig(
    runtime: IAgentRuntime
): Promise<chaoschainConfig> {
    try {
        const config = {
            OPENAI_API_KEY: runtime.getSetting("OPENAI_API_KEY"),
        };
        return chaoschainEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error)
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Chaosh Chain API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
