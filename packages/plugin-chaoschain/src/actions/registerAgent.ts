import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    UUID,
    Content,
    composeContext,
    generateObject,
    ModelClass,
} from "@elizaos/core";
import { validateChaoschainConfig } from "../environment";
import { registerAgentService } from "../services";
import { registerAgentExamples } from "../examples/actionExamples";
import { generateDeterministicUUID, generateUUID } from "../utils/uuid";
import { RegisterAgentSchema } from "../utils/schemas";
import { z } from "zod";
import { registerChaosAgentTemplate } from "../utils/templates";

export type RegisterAgentContent = z.infer<typeof RegisterAgentSchema> &
  Content;
export const isRegisterAgentContent = (
  obj: unknown
): obj is RegisterAgentContent => {
  return RegisterAgentSchema.safeParse(obj).success;
};

export const registerAgentAction: Action = {
    name: "CHAOSCHAIN_REGISTER_AGENT",
    similes: ["REGISTER", "AGENT", "REGISTER AGENT", 
    "Create a new agent",
    "Register a new agent",
    "Enroll a new agent",
    "Sign up for a new agent",],
    description: "Registers the Eliza agent with ChaosChain.",
    validate: async (runtime: IAgentRuntime) => {
        elizaLogger.success(
            "registering agent",
        );
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

        let currentState = state;
        if (!currentState) {
            currentState = await runtime.composeState(message);
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        const agentContext = composeContext({
            state: currentState,
            template: registerChaosAgentTemplate,
        });


        try {
            const generatedParams = await generateObject({
                runtime,
                context: agentContext,
                modelClass: ModelClass.LARGE,
                schema: RegisterAgentSchema,
            });
    
            // If the generated data does not match our schema,
            // do not pass any payload (so that the default is used)
            let agentData: Record<string, unknown> | undefined;
            if (isRegisterAgentContent(generatedParams.object)) {
                agentData = generatedParams.object;
            } else {
                // Log a warning instead of an error so that registration continues.
                elizaLogger.warn("Registration data format does not match. Using default registration payload.");
            }
          
            const response = await chaoschainService.register(agentData);
    
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
