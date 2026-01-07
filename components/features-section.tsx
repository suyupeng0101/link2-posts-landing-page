import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Zap, Link2, Copy, CreditCard, Share2, FileText, Video } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: "Timestamp-Based Outputs",
      description: "Every highlight clip comes with exact timestamps, making it easy to create short-form content",
    },
    {
      icon: Copy,
      title: "Copy-Ready Assets",
      description: "All content is formatted and ready to publish. Just copy and paste—no editing required",
    },
    {
      icon: CreditCard,
      title: "Credits Billing",
      description:
        "Pay only for what you use. Each minute of transcription and generation costs credits, with caching to save you money",
    },
    {
      icon: Share2,
      title: "Shareable Links",
      description: "Generate unique links to share your content packages with team members or clients",
    },
    {
      icon: Video,
      title: "Built for YouTube & Live Replays",
      description: "Optimized for long-form content, podcasts, tutorials, and live stream recordings",
    },
    {
      icon: FileText,
      title: "Multiple Content Formats",
      description: "Get X threads, standalone tweets, YouTube SEO, and highlight clips all in one generation",
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "Most videos are processed in under 2 minutes. Get your content assets quickly",
    },
    {
      icon: Link2,
      title: "Support for X Videos (Beta)",
      description: "Paste X video links directly—no need to download. Perfect for repurposing social content",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to turn your videos into engaging social content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
