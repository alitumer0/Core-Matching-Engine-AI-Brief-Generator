'use client'

import { trpc } from '@/trpc/client'
import { Campaign } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import BriefModal from './brief-modal'
import { Loader2, ArrowLeft, Trophy, Users, Crosshair, Star, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ClientCampaignDetails({ campaign }: { campaign: Campaign }) {
    const { data: matchedCreators, isLoading } = trpc.matching.getMatchedCreators.useQuery({ campaignId: campaign.id })
    const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary relative z-10 animate-spin" />
                </div>
                <p className="text-2xl font-semibold tracking-tight animate-pulse text-foreground/80">
                    Running Matching Engine...
                </p>
                <p className="text-muted-foreground text-sm">Evaluating 40+ data points per creator.</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] selection:bg-primary/30 pb-20">
            {/* Header Section */}
            <div className="bg-background border-b border-border/40 sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="inline-flex flex-shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Campaigns
                    </Link>
                    <div className="flex gap-3">
                        <Badge variant="secondary" className="hidden sm:inline-flex capitalize">Objective: {campaign.objective}</Badge>
                        <Badge variant="outline" className="hidden sm:inline-flex">Target: {campaign.targetCountry}</Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 pt-12 pb-8">
                <div className="mb-12 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-4">
                        {campaign.brand}
                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-none px-3 py-1 text-sm rounded-full pointer-events-none">
                            Active Matching
                        </Badge>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Below is the curated list of creators ranked by algorithmic suitablity for your specific requirements.
                    </p>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Top Creator Matches
                    </h2>
                    <span className="flex items-center justify-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                        {matchedCreators?.length || 0} Found
                    </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {matchedCreators?.map(({ creator, totalScore, scoreBreakdown, matchingLogs }, i) => (
                        <Card key={creator.id} className="group relative overflow-hidden flex flex-col border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] bg-background/50 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Score Ribbon */}
                            <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-1 z-10">
                                <div className="flex items-center justify-center shadow-lg bg-gradient-to-bl from-primary to-primary/80 text-primary-foreground font-black px-5 py-2.5 rounded-2xl text-2xl tracking-tighter ring-4 ring-background">
                                    {totalScore.toFixed(0)}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mr-1">Match Score</span>
                            </div>

                            <CardHeader className="pb-4 relative z-10 pr-32">
                                <div className="flex flex-col gap-1 mb-3">
                                    <div className="flex items-center gap-2">
                                        {i === 0 && <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-none shadow-none gap-1"><Trophy className="w-3 h-3" /> #1 Pick</Badge>}
                                        <Badge variant="outline" className="text-foreground/70">{creator.country}</Badge>
                                    </div>
                                    <CardTitle className="text-3xl font-extrabold tracking-tight">@{creator.username}</CardTitle>
                                    <CardDescription className="text-base font-medium text-foreground/80 mt-1 flex items-center gap-1.5 line-clamp-1">
                                        <Users className="w-4 h-4 text-muted-foreground" /> {creator.followers.toLocaleString()} subscribers
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="relative z-10 flex-1 flex flex-col">
                                {/* Score Breakdown Matrix */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-muted/40 p-4 rounded-2xl border border-border/40">
                                    <div className="flex flex-col p-2 bg-background/60 rounded-xl shadow-sm border border-border/30">
                                        <span className="text-[10px] md:text-[11px] uppercase text-muted-foreground font-bold tracking-wider mb-1 flex items-center gap-1.5"><Users className="w-3 h-3" /> Audience</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-foreground/90">{scoreBreakdown.audience.toFixed(1)}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/50">/30</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-2 bg-background/60 rounded-xl shadow-sm border border-border/30">
                                        <span className="text-[10px] md:text-[11px] uppercase text-muted-foreground font-bold tracking-wider mb-1 flex items-center gap-1.5"><Crosshair className="w-3 h-3" /> Niche</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-foreground/90">{scoreBreakdown.niche.toFixed(1)}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/50">/20</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-2 bg-background/60 rounded-xl shadow-sm border border-border/30">
                                        <span className="text-[10px] md:text-[11px] uppercase text-muted-foreground font-bold tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Perf.</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-foreground/90">{scoreBreakdown.performance.toFixed(1)}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/50">/30</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-2 bg-background/60 rounded-xl shadow-sm border border-border/30">
                                        <span className="text-[10px] md:text-[11px] uppercase text-primary font-bold tracking-wider mb-1 flex items-center gap-1.5"><Star className="w-3 h-3" /> Style</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-primary">{scoreBreakdown.contentStyle.toFixed(1)}</span>
                                            <span className="text-[10px] font-bold text-primary/40">/20</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="bg-primary/[0.03] rounded-xl p-4 border border-primary/10">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2.5 block">Engine Insights</span>
                                        <ul className="space-y-1.5">
                                            {matchingLogs?.slice(0, 4).map((log: string, idx: number) => (
                                                <li key={idx} className="text-[11px] font-medium text-foreground/70 flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                                                    {log}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-3">Creator Expertise</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {creator.niches.map((n: string) => (
                                                <Badge key={n} variant="secondary" className="capitalize px-3 py-1 font-medium hover:bg-secondary/80">
                                                    {n}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="relative z-10 pt-6 mt-auto bg-gradient-to-t from-muted/30 to-transparent">
                                <Button
                                    onClick={() => setSelectedCreatorId(creator.id)}
                                    size="lg"
                                    className="w-full sm:w-auto font-semibold shadow-md hover:shadow-xl transition-all"
                                >
                                    Generate AI Brief
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {selectedCreatorId && (
                    <BriefModal
                        campaignId={campaign.id}
                        creatorId={selectedCreatorId}
                        onClose={() => setSelectedCreatorId(null)}
                    />
                )}
            </div>
        </main>
    )
}
