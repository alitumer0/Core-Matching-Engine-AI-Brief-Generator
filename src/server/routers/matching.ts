import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';


export const matchingRouter = router({
    getMatchedCreators: publicProcedure
        .input(z.object({ campaignId: z.string() }))
        .query(async ({ input }) => {
            /**
             * CREATOR MATCHING ENGINE CORE LOGIC
             * 
             * This procedure evaluates every creator in the database against the specific requirements 
             * of a campaign. It calculates a weighted score (0-100) based on multiple metrics:
             * 
             * 1. Brand Safety (Hard Constraint)
             * 2. Audience Demographics (Country + Gender match)
             * 3. Niche Alignment (Industry/Topic relevance)
             * 4. Performance Metrics (Followers, Engagement, Watch Time)
             * 5. Content Style Match (Tone & Hook Types)
             */
            const campaign = await prisma.campaign.findUnique({
                where: { id: input.campaignId }
            });

            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const creators = await prisma.creator.findMany();

            // Use Postgres arrays directly
            const cNiches = campaign.niches || [];
            const cHookTypes = campaign.preferredHookTypes || [];
            const cDoNotUseWords = campaign.doNotUseWords || [];

            const scoredCreators = creators.map((creator) => {
                const crNiches = creator.niches || [];
                const crBrandSafetyFlags = creator.brandSafetyFlags || [];
                const crTopCountries = creator.topCountries || [];

                let totalScore = 0;
                const matchingLogs: string[] = [];
                const scoreBreakdown = {
                    audience: 0,
                    niche: 0,
                    performance: 0,
                    contentStyle: 0,
                };

                // 1. HARD CONSTRAINT: Brand Safety Check
                const hasSafetyIssue = cDoNotUseWords.some(word =>
                    crBrandSafetyFlags.some(flag => flag.toLowerCase().includes(word.toLowerCase()))
                );

                if (hasSafetyIssue) {
                    return { creator, totalScore: 0, scoreBreakdown, eliminated: true, reason: 'Brand Safety Violation', matchingLogs: ['❌ ELIMINATED: Brand Safety Conflict detected'] };
                }

                // 2. Audience Match (Max 30 points)
                // - Country Match (15 pts)
                if (crTopCountries.includes(campaign.targetCountry)) {
                    scoreBreakdown.audience += 15;
                    matchingLogs.push(`✓ Audience: Precise Country Match (${campaign.targetCountry})`);
                } else {
                    matchingLogs.push(`⚠ Audience: Secondary Country Reach`);
                }

                // - Gender Match (15 pts)
                if (campaign.targetGender === 'female' && creator.femaleSplit > 0.6) {
                    scoreBreakdown.audience += 15;
                    matchingLogs.push("✓ Audience: Strong Female Demographic Match");
                } else if (campaign.targetGender === 'male' && creator.maleSplit > 0.6) {
                    scoreBreakdown.audience += 15;
                    matchingLogs.push("✓ Audience: Strong Male Demographic Match");
                } else if (campaign.targetGender === 'all') {
                    scoreBreakdown.audience += 15;
                    matchingLogs.push("✓ Audience: Universal Demographic Fit");
                } else {
                    scoreBreakdown.audience += 5;
                    matchingLogs.push("⚠ Audience: Partial Demographic Offset");
                }

                // 3. Niche Match (Max 20 points)
                const commonNiches = cNiches.filter(n => crNiches.includes(n));
                if (commonNiches.length === cNiches.length && cNiches.length > 0) {
                    scoreBreakdown.niche = 20;
                    matchingLogs.push("✓ Niche: Perfect Industry Alignment");
                } else if (commonNiches.length > 0) {
                    scoreBreakdown.niche = 10;
                    matchingLogs.push(`✓ Niche: Partial Alignment (${commonNiches.length} shared topics)`);
                } else {
                    matchingLogs.push("⚠ Niche: Adjacent Industry Reach");
                }

                // 4. Performance & Budget (Max 30 points)
                if (creator.followers >= campaign.minFollowers && creator.followers <= campaign.maxFollowers) {
                    scoreBreakdown.performance += 15;
                    matchingLogs.push("✓ Performance: Optimal Follower Range");
                } else if (creator.followers > campaign.maxFollowers) {
                    scoreBreakdown.performance += 5;
                    matchingLogs.push("⚠ Performance: High Follower Count (Potential Budget Stretch)");
                }

                if (creator.avgWatchTime >= campaign.minAvgWatchTime) {
                    scoreBreakdown.performance += 7.5;
                    matchingLogs.push("✓ Performance: Retains High Watch-Time Average");
                }

                if (creator.engagementRate >= 0.05) {
                    scoreBreakdown.performance += 7.5;
                    matchingLogs.push("✓ Performance: Exceptional Engagement Benchmarks");
                }

                // 5. Content Style Match (Max 20 points)
                if (cHookTypes.includes(creator.primaryHookType)) {
                    scoreBreakdown.contentStyle += 10;
                    matchingLogs.push(`✓ Style: Master of '${creator.primaryHookType}' Hook Type`);
                }
                if (creator.contentStyle === campaign.tone || campaign.tone.includes(creator.contentStyle)) {
                    scoreBreakdown.contentStyle += 10;
                    matchingLogs.push(`✓ Style: Creative Tone Matches Brand Identity`);
                }

                totalScore = scoreBreakdown.audience + scoreBreakdown.niche + scoreBreakdown.performance + scoreBreakdown.contentStyle;

                return {
                    creator,
                    totalScore,
                    scoreBreakdown,
                    matchingLogs,
                    eliminated: false
                };
            });

            // Filter eliminated, and sort by score descending
            return scoredCreators
                .filter(c => !c.eliminated)
                .sort((a, b) => b.totalScore - a.totalScore);
        })
});
