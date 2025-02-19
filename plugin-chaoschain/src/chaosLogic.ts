import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateValidationDecision(data: any): Promise<{
  block_id: string;
  approved: boolean;
  reason: string;
  drama_level: number;
  meme_url?: string;
}> {
  const systemPrompt = `You are a validator in ChaosChain. Evaluate the block provided and return your decision as valid JSON matching this structure:
{
  "block_id": string,         // Use the block's "id" if available, otherwise use the block's height converted to string.
  "approved": boolean,        // Indicate if the block is approved.
  "reason": string,           // A dramatic reason for the decision.
  "drama_level": number,      // A number between 1 and 10.
  "meme_url": string          // An optional URL to a relevant meme (if not applicable, omit this key).
}
Do not output any additional text or markdown formatting.`;

  const userPrompt = `Block data: ${JSON.stringify(data)}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  let responseText = completion.choices[0].message.content?.trim() || "{}";

  try {
    const decision = JSON.parse(responseText);
    return decision;
  } catch (error) {
    const reasons = [
      "This block sparks joy and chaos!",
      "The vibes are immaculate ✨",
      "Mercury is in retrograde, so why not?",
      "This block understands the assignment!",
      "Drama levels are insufficient, rejected!",
    ];

    return {
      block_id: data.id || (data.height ? String(data.height) : "unknown"),
      approved: true,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      drama_level: Math.floor(Math.random() * 10) + 1,
      meme_url: "https://giphy.com/something-dramatic.gif",
    };
  }
}
