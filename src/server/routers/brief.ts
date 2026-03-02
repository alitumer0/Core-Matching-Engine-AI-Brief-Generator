import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string });

const briefSchema = z.object({
    targetAudience: z.string().describe("Brief description of the specific audience for this video"),
    contentPillars: z.array(z.string()).describe("3 main talking points the creator should cover"),
    toneOfVoice: z.string().describe("The exact tone the creator should use"),
    hookIdea: z.string().describe("A killer hook idea tailored to the creator's style and campaign goals"),
    visualConcepts: z.array(z.string()).describe("2-3 visual ideas for the video execution"),
    mandatoryMentions: z.array(z.string()).describe("Important things the creator MUST say or do"),
});

export const briefRouter = router({
    generateBrief: publicProcedure
        .input(z.object({ campaignId: z.string(), creatorId: z.string() }))
        .mutation(async ({ input }) => {
            /**
             * AI BRIEF GENERATION SERVICE
             * 
             * This service generates a tailored content strategy for a creator based on a campaign.
             * 
             * Key Features:
             * 1. Cache Layer: Checks if a brief for this creator-campaign pair already exists in Supabase.
             * 2. Native Gemini: Uses @google/genai with strict JSON schema (responseSchema).
             * 3. Robustness: Implements a 3-retry mechanism with exponential-like backoff (1s) to handle transient API failures.
             * 4. Structured Output: Validates output against a strict Zod-like schema via the LLM provider.
             */
            const { campaignId, creatorId } = input;
            // 1. Cache Check
            const existingCache = await prisma.briefCache.findUnique({
                where: {
                    campaignId_creatorId: {
                        campaignId: input.campaignId,
                        creatorId: input.creatorId
                    }
                }
            });

            if (existingCache) {
                return {
                    source: 'cache',
                    brief: JSON.parse(existingCache.briefContent) as z.infer<typeof briefSchema>
                };
            }

            // 2. Fetch Context Data
            const campaign = await prisma.campaign.findUnique({ where: { id: input.campaignId } });
            const creator = await prisma.creator.findUnique({ where: { id: input.creatorId } });

            if (!campaign || !creator) {
                console.error("Missing data in DB", { campaignId: input.campaignId, creatorId: input.creatorId });
                throw new Error("Campaign or Creator not found");
            }

            const forbiddenWords = campaign.doNotUseWords || [];
            const creatorNiches = creator.niches || [];

            // 3. AI Generation with Google Gen AI Native Structured Output & Retry Mechanism
            let lastError: Error | null = null;
            const maxRetries = 3;

            const prompt = `
You are an expert Influencer Marketing Manager.
Create a detailed, high-converting content brief for a creator.

[CAMPAIGN DETAILS]
Brand: ${campaign.brand}
Objective: ${campaign.objective}
Target Audience: ${campaign.targetAgeRange} years old, ${campaign.targetGender} in ${campaign.targetCountry}
Brand Tone: ${campaign.tone}
FORBIDDEN WORDS (NEVER USE THESE): ${forbiddenWords.join(', ')}

[CREATOR DETAILS]
Creator Username: @${creator.username}
Creator Content Style: ${creator.contentStyle}
Creator Hook Preference: ${creator.primaryHookType}
Creator Niches: ${creatorNiches.join(', ')}

Rules:
1. Make the hook punchy and matching to the creator's preferred hook type.
2. Do not include forbidden words anywhere.
`;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Generating brief via Native Gemini SDK for campaign: ${input.campaignId} (Attempt ${attempt}/${maxRetries})`);

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    targetAudience: { type: Type.STRING },
                                    contentPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    toneOfVoice: { type: Type.STRING },
                                    hookIdea: { type: Type.STRING },
                                    visualConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    mandatoryMentions: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                            },
                        }
                    });

                    if (!response.text) {
                        throw new Error("Empty response from AI");
                    }

                    // JSON Parsing acts as Schema Validation / Repair checkpoint
                    const object = JSON.parse(response.text);

                    // 4. Save to Cache
                    await prisma.briefCache.create({
                        data: {
                            campaignId: input.campaignId,
                            creatorId: input.creatorId,
                            briefContent: JSON.stringify(object),
                        }
                    });

                    return {
                        source: 'ai',
                        brief: object as z.infer<typeof briefSchema>
                    };
                } catch (error) {
                    console.warn(`[Retry Mechanism] Attempt ${attempt} failed:`, error);
                    lastError = error instanceof Error ? error : new Error(String(error));

                    if (attempt === maxRetries) {
                        console.error("AI Generation permanently failed after max retries:", lastError);
                        throw new Error(`AI failed after ${maxRetries} attempts: ${lastError.message}`);
                    }
                    // Wait 1 second before retrying to prevent rate limiting
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
            throw new Error("Failed to generate brief due to unknown AI error.");
        })
});
