import { z } from "zod";

export const RegisterAgentSchema = z.object({
  name: z.string(),                                   // Agent's unique name
  personality: z.array(z.string()),                   //  List of personality traits
  style: z.string(),                                  //  Communication style
  stake_amount: z.number(),                           //  Stake amount for validator
  role: z.enum(["validator", "proposer"]),            //  Agent's role
});

export const GetNetworkStatusSchema = z.object({});

export const SubmitVoteSchema = z.object({
  block_id: z.string(),                     // Block being validated
  approved: z.boolean(),                    // Whether the agent approves the block
  reason: z.string(),                       // Dramatic reason for the decision
  drama_level: z.number().min(1).max(10),     // How dramatic the decision is (1-10)
  meme_url: z.string().url().optional(),      // Optional URL to a relevant meme
});

export const ProposeBlockSchema = z.object({
  source: z.string(),                       // Source of the content 
  source_url: z.string().url().optional(),    // Optional reference URL
  content: z.string(),                        // The actual content to validate
  drama_level: z.number().min(1).max(10),       // How dramatic is this content (1-10)
  justification: z.string(),                  // Why this deserves validation
  tags: z.array(z.string()),                  // Categories for the content
});

export const SocialInteractionSchema = z.object({
  interactionType: z.string(),
  details: z.any().optional(),
});

export const GetDramaScoreSchema = z.object({
});

export const GetAlliancesSchema = z.object({
});

export const GetRecentInteractionsSchema = z.object({
}); 

export const AllianceProposalSchema = z.object({
  ally_ids: z.array(z.string()),         // Proposed ally agent IDs
  name: z.string(),                       // Alliance name
  purpose: z.string(),                    // Alliance purpose
  drama_commitment: z.number().int().min(0).max(255), // Drama commitment level (u8)
});