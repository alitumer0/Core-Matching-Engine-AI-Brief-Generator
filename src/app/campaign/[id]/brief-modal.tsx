'use client'

import { trpc } from '@/trpc/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, X, CheckCircle2, History, Target, Zap, Image as ImageIcon, FileText, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BriefModal({ campaignId, creatorId, onClose }: { campaignId: string, creatorId: string, onClose: () => void }) {
    const mutation = trpc.brief.generateBrief.useMutation()
    const [hasGenerated, setHasGenerated] = useState(false)

    const handleGenerate = () => {
        mutation.mutate({ campaignId, creatorId }, {
            onSuccess: () => setHasGenerated(true)
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border-primary/20 overflow-hidden ring-1 ring-border/50">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/30 px-6 py-4">
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        AI Content Brief
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 relative bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <ScrollArea className="h-[calc(90vh-80px)] w-full relative">
                        <div className="p-6 md:p-8">
                            {!hasGenerated && !mutation.isPending && (
                                <div className="flex flex-col items-center justify-center text-center py-20 gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-3xl relative z-10 border border-primary/20 shadow-inner">
                                            <Sparkles className="w-16 h-16 text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-extrabold tracking-tight">Generate Strategy</h3>
                                        <p className="text-muted-foreground max-w-lg text-lg leading-relaxed mx-auto">
                                            We'll use AI to analyze campaign restrictions, target audience, and creator style to synthesize a unique content brief.
                                        </p>
                                    </div>
                                    <Button onClick={handleGenerate} size="lg" className="mt-4 text-base h-14 px-8 font-bold gap-2 shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto">
                                        <Sparkles className="w-5 h-5 fill-primary-foreground/20" /> Generate Intelligence
                                    </Button>
                                </div>
                            )}

                            {mutation.isPending && (
                                <div className="flex flex-col items-center justify-center text-center py-32 gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                        <Loader2 className="w-16 h-16 text-primary relative z-10 animate-spin" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-bold animate-pulse">Crafting Narrative...</p>
                                        <p className="text-base text-muted-foreground max-w-sm mx-auto">Evaluating content constraints, parsing target demographics, and building structured JSON response.</p>
                                    </div>
                                </div>
                            )}

                            {mutation.isError && (
                                <div className="flex flex-col items-center justify-center text-center py-20 gap-4 text-destructive">
                                    <div className="bg-destructive/10 p-4 rounded-full">
                                        <AlertTriangle className="w-12 h-12 text-destructive" />
                                    </div>
                                    <p className="text-2xl font-bold">Generation Failed</p>
                                    <p className="text-muted-foreground">{mutation.error.message}</p>
                                    <Button onClick={handleGenerate} variant="outline" className="mt-4 border-destructive/20 hover:bg-destructive/10">Try Again</Button>
                                </div>
                            )}

                            {mutation.isSuccess && mutation.data && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-10">
                                    <div className="flex items-center justify-between border-b border-border/40 pb-6">
                                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 font-medium bg-background">
                                            {mutation.data.source === 'cache' ? <History className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                            Source: {mutation.data.source.toUpperCase()}
                                        </Badge>
                                    </div>

                                    {/* Top Row: Audience & Tone */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-sm">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-primary" /> Target Audience
                                            </h3>
                                            <p className="text-lg leading-relaxed font-medium text-foreground/90">{mutation.data.brief.targetAudience}</p>
                                        </div>

                                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Tone of Voice
                                            </h3>
                                            <p className="text-lg leading-relaxed italic text-primary/90 font-medium">
                                                "{mutation.data.brief.toneOfVoice}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle Row: Hook Idea */}
                                    <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <Zap className="w-32 h-32 text-blue-500" />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2 relative z-10">
                                            <Zap className="w-4 h-4" /> Hook Idea
                                        </h3>
                                        <p className="text-2xl md:text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight leading-snug relative z-10">
                                            "{mutation.data.brief.hookIdea}"
                                        </p>
                                    </div>

                                    {/* Bottom Grid: Visuals, Pillars, Mentions */}
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        {/* Content Pillars */}
                                        <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-sm lg:col-span-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary" /> Content Pillars
                                            </h3>
                                            <ul className="space-y-4">
                                                {mutation.data.brief.contentPillars.map((pillar, i) => (
                                                    <li key={i} className="flex gap-4 items-start group">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {i + 1}
                                                        </span>
                                                        <p className="text-lg text-foreground/90 pt-0.5 leading-relaxed">{pillar}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Visual Concepts */}
                                            <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-purple-500" /> Visual Concepts
                                                </h3>
                                                <ul className="space-y-3">
                                                    {mutation.data.brief.visualConcepts.map((concept, i) => (
                                                        <li key={i} className="flex gap-3 items-start text-sm">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                                            <span className="text-foreground/80 leading-relaxed">{concept}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Mandatory Mentions */}
                                            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Mandatory Mentions
                                                </h3>
                                                <ul className="space-y-2">
                                                    {mutation.data.brief.mandatoryMentions.map((mention, i) => (
                                                        <li key={i} className="bg-destructive/10 text-destructive/90 text-sm p-3 rounded-lg font-semibold flex gap-2 items-start">
                                                            <span className="mt-0.5">•</span>
                                                            {mention}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
