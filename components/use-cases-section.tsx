import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Radio, Mic, User } from "lucide-react"

export function UseCasesSection() {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Tutorial YouTubers",
      description:
        "Turn your how-to videos into step-by-step threads and SEO-optimized descriptions that drive more views",
      examples: [
        "Extract key lessons as tweets",
        "Generate chapter timestamps automatically",
        "Create teaser content for promotion",
      ],
    },
    {
      icon: Radio,
      title: "Live Replay Planners",
      description: "Repurpose your live streams into bite-sized content for maximum reach across platforms",
      examples: ["Identify best moments from VODs", "Create highlight reels", "Build anticipation for next stream"],
    },
    {
      icon: Mic,
      title: "Interview & Podcast Channels",
      description: "Extract quotable moments and create engaging threads from long-form conversations",
      examples: ["Pull out guest insights", "Generate episode summaries", "Create audiograms with timestamps"],
    },
    {
      icon: User,
      title: "Solo Creators on X",
      description: "Maximize your video content by turning it into threads that grow your X audience",
      examples: ["Cross-post to multiple platforms", "Build thought leadership", "Drive traffic back to YouTube"],
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Perfect For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a YouTuber, streamer, or podcaster, Link2Posts helps you maximize your content reach
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <useCase.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
