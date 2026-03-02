import { PrismaClient } from '@prisma/client'
import campaignsData from './campaigns.json'
import creatorsData from './creators.json'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clear existing
    await prisma.briefCache.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.creator.deleteMany()

    // Seed Campaigns
    for (const c of campaignsData) {
        await prisma.campaign.create({
            data: {
                id: c.id,
                brand: c.brand,
                objective: c.objective,
                targetCountry: c.targetCountry,
                targetGender: c.targetGender,
                targetAgeRange: c.targetAgeRange,
                niches: c.niches,
                preferredHookTypes: c.preferredHookTypes,
                minAvgWatchTime: c.minAvgWatchTime,
                minFollowers: c.budgetRange.minFollowers,
                maxFollowers: c.budgetRange.maxFollowers,
                tone: c.tone,
                doNotUseWords: c.doNotUseWords,
            }
        })
    }

    // Seed Creators
    for (const c of creatorsData) {
        await prisma.creator.create({
            data: {
                id: c.id,
                username: c.username,
                country: c.country,
                niches: c.niches,
                followers: c.followers,
                engagementRate: c.engagementRate,
                avgWatchTime: c.avgWatchTime,
                contentStyle: c.contentStyle,
                primaryHookType: c.primaryHookType,
                brandSafetyFlags: c.brandSafetyFlags,
                topCountries: c.audience.topCountries,
                femaleSplit: c.audience.genderSplit.female || 0,
                maleSplit: c.audience.genderSplit.male || 0,
                topAgeRange: c.audience.topAgeRange,
            }
        })
    }

    console.log('Seeding completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
