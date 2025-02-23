import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    UUID,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment";
import { registerAgentService } from "../services";
import { registerAgentExamples } from "../examples/actionExamples";
import { generateDeterministicUUID, generateUUID } from "../utils/uuid";

let counter = 0;

export const registerAgentAction: Action = {
    name: "CHAOSCHAIN_REGISTER_AGENT",
    similes: ["REGISTER", "AGENT", "CHAOSCHAIN"],
    description: "Registers the Eliza agent with ChaosChain.",
    validate: async (runtime: IAgentRuntime) => {
        await validateChaoschainConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateChaoschainConfig(runtime);
        const chaoschainService = registerAgentService();

        try {
            const response = await chaoschainService.register();

            elizaLogger.success(
                "[ChaosChain] Agent registered successfully.",
                response
            );

            // set the registered agent on eliza cache
            await runtime.cacheManager.set(
                message.roomId,
                JSON.stringify({
                    agent_id: response.agent_id,
                    agent_token: response.token,
                })
            );

            callback({
                text: `Agent ${response.agent_id} successfully registered on ChaosChain with token ${response.token}!`,
            });
            return true;
        } catch (error: any) {
            elizaLogger.error("[ChaosChain] Error registering agent:", error);
            callback({
                text: `Error registering agent: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: registerAgentExamples as ActionExample[][],
} as Action;
