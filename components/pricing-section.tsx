import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      credits: "20 credits",
      description: "Try Link2Posts with limited credits",
      features: [
        "~5 minutes of video transcription",
        "1-2 content generation packages",
        "All output formats included",
        "Email support",
        "Content expires after 7 days",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Starter",
      price: "$9",
      credits: "60 credits",
      description: "Perfect for casual creators",
      features: [
        "~15 minutes of video transcription",
        "Up to 5 content packages",
        "All output formats included",
        "Priority email support",
        "Content saved for 30 days",
        "Export to PDF/JSON",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Creator",
      price: "$19",
      credits: "180 credits",
      description: "Best for regular content creators",
      features: [
        "~45 minutes of video transcription",
        "Up to 15 content packages",
        "All output formats included",
        "Priority support + live chat",
        "Content saved forever",
        "Export to PDF/JSON",
        "Shareable team links",
        "Subtitle caching (save credits)",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Pro",
      price: "$29",
      credits: "420 credits",
      description: "For power users and agencies",
      features: [
        "~105 minutes of video transcription",
        "Up to 35 content packages",
        "All output formats included",
        "Dedicated support",
        "Content saved forever",
        "Export to PDF/JSON",
        "Shareable team links",
        "Subtitle caching (save credits)",
        "Custom branding",
        "API access (coming soon)",
      ],
      cta: "Get Started",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm font-medium text-primary">{plan.credits}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">How Credits Work</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • <span className="font-medium text-foreground">Transcription:</span> 2 credits per minute of video
              </p>
              <p>
                • <span className="font-medium text-foreground">Content Generation:</span> 6 credits per asset package
                (Thread + Tweets + SEO + Highlights)
              </p>
              <p>
                • <span className="font-medium text-foreground">Save Credits:</span> If your video already has subtitles
                or we've cached it, transcription is free!
              </p>
              <p className="pt-2 text-xs">
                Example: A 10-minute video costs 20 credits (transcription) + 6 credits (generation) = 26 credits total
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
