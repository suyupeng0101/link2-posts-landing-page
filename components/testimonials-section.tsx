import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tech YouTuber",
      avatar: "/avatar-woman-asian.jpg",
      initials: "SC",
      content:
        "Link2Posts has cut my content repurposing time from 3 hours to 10 minutes. The X threads it generates actually sound like me. Game changer for solo creators.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Podcast Host",
      avatar: "/avatar-man-black.jpg",
      initials: "MJ",
      content:
        "I was skeptical about AI-generated content, but the quality is incredible. The highlight suggestions alone are worth the price—they always pick the best moments.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "Live Streamer",
      avatar: "/avatar-woman-latina.jpg",
      initials: "ER",
      content:
        "Finally, a tool that understands long-form content. The timestamp accuracy is perfect for creating clips, and the SEO metadata has doubled my YouTube views.",
      rating: 5,
    },
    {
      name: "David Park",
      role: "Content Agency Owner",
      avatar: "/avatar-man-asian.jpg",
      initials: "DP",
      content:
        "We process 50+ videos per week for clients. Link2Posts saves us hundreds of hours and the shareable links make collaboration seamless. Worth every credit.",
      rating: 5,
    },
    {
      name: "Amara Williams",
      role: "Tutorial Creator",
      avatar: "/avatar-woman-black.jpg",
      initials: "AW",
      content:
        "The chapter timestamps are so accurate! I use them directly in my videos. And the multiple title options help me A/B test what works best.",
      rating: 5,
    },
    {
      name: "Tom Anderson",
      role: "Gaming Streamer",
      avatar: "/avatar-man-white.jpg",
      initials: "TA",
      content:
        "I upload 3-4 hour streams and Link2Posts finds the perfect highlights every time. My Twitter engagement has tripled since using the generated threads.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Loved by Creators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of content creators who are maximizing their reach with Link2Posts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">{testimonial.content}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
