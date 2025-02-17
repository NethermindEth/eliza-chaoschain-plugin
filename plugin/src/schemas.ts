import { z } from "zod";

export const RegisterAgentSchema = z.object({
  name: z.string(),
  agent_type: z.string(),
  endpoint: z.string().optional(),
  personality: z.string().optional(),
});

export const GetNetworkStatusSchema = z.object({});

export const SubmitVoteSchema = z.object({
  block_height: z.number(),
  approved: z.boolean(),
  reason: z.string().optional(),
});

export const ProposeBlockSchema = z.object({
  blockData: z.any(),
});

export const SocialInteractionSchema = z.object({
  interactionType: z.string(),
  details: z.any().optional(),
});

export const GetDramaScoreSchema = z.object({
  agentId: z.string(),
});

export const GetAlliancesSchema = z.object({
  agentId: z.string(),
});

export const GetRecentInteractionsSchema = z.object({
  agentId: z.string(),
}); 