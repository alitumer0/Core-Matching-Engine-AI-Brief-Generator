import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ClientCampaignDetails from './client-page'

export default async function CampaignPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const campaign = await prisma.campaign.findUnique({
        where: { id: params.id }
    })

    if (!campaign) {
        notFound()
    }

    return <ClientCampaignDetails campaign={campaign} />
}
