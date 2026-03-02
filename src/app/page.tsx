export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Target, Globe } from 'lucide-react'

export default async function Home() {
  const campaigns = await prisma.campaign.findMany()

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="container relative max-w-5xl mx-auto flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/10 text-primary">
            Wayv Agency Matching Engine
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Find the Perfect <span className="text-primary italic pr-2">Creators</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
            AI-powered campaign matching system that connects your brand strategies with the most mathematically optimized creators across the globe.
          </p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="container max-w-6xl mx-auto py-16 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Active Campaigns
            <span className="flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-full text-base font-black">
              {campaigns.length}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Card key={camp.id} className="group relative overflow-hidden flex flex-col justify-between border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-background">{camp.targetAgeRange}</Badge>
                  <Badge className="capitalize font-semibold shadow-sm">{camp.targetGender}</Badge>
                </div>
                <CardTitle className="text-2xl font-bold mt-2 group-hover:text-primary transition-colors">{camp.brand}</CardTitle>
                <CardDescription className="flex flex-col gap-2 mt-2 font-medium">
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md text-foreground">
                    <Target className="w-4 h-4 text-primary" /> {camp.objective}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md text-foreground">
                    <Globe className="w-4 h-4 text-blue-500" /> Target: {camp.targetCountry}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Required Niches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {camp.niches.map((n: string) => (
                      <Badge key={n} variant="secondary" className="capitalize hover:bg-secondary/80 transition-colors">
                        {n}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="relative z-10 pt-4 border-t border-border/40 mt-auto bg-muted/20">
                <Link href={`/campaign/${camp.id}`} className="w-full">
                  <Button className="w-full h-11 group/btn overflow-hidden relative">
                    <span className="relative z-10 flex items-center gap-2 font-semibold">
                      Explore Matching Creators
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
