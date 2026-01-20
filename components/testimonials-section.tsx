"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function TestimonialsSection() {
  const { locale } = useI18n()
  const copy =
    locale === "zh-Hans"
      ? {
          title: "创作者都在用",
          subtitle: "加入成千上万的创作者，最大化内容分发与触达",
          testimonials: [
            {
              name: "Sarah Chen",
              role: "科技类 YouTuber",
              avatar: "/avatar-woman-asian.jpg",
              initials: "SC",
              content:
                "Link2Posts 把我内容再利用的时间从 3 小时缩短到 10 分钟。生成的 X Thread 真的像我写的，单人创作者的神器。",
              rating: 5,
            },
            {
              name: "Marcus Johnson",
              role: "播客主持人",
              avatar: "/avatar-man-black.jpg",
              initials: "MJ",
              content:
                "我原本对 AI 生成内容很怀疑，但质量很惊喜。高亮建议本身就值回票价，总能抓到最佳片段。",
              rating: 5,
            },
            {
              name: "Elena Rodriguez",
              role: "直播主",
              avatar: "/avatar-woman-latina.jpg",
              initials: "ER",
              content:
                "终于有工具能理解长视频了。时间戳非常准确，适合做切片；SEO 元数据让我的 YouTube 观看量翻倍。",
              rating: 5,
            },
            {
              name: "David Park",
              role: "内容代理机构负责人",
              avatar: "/avatar-man-asian.jpg",
              initials: "DP",
              content:
                "我们每周处理 50+ 条视频。Link2Posts 节省了数百小时，可分享链接也让协作更顺畅，每个积分都值得。",
              rating: 5,
            },
            {
              name: "Amara Williams",
              role: "教程创作者",
              avatar: "/avatar-woman-black.jpg",
              initials: "AW",
              content:
                "章节时间戳非常准，我直接用在视频里。多个标题候选也方便做 A/B 测试。",
              rating: 5,
            },
            {
              name: "Tom Anderson",
              role: "游戏主播",
              avatar: "/avatar-man-white.jpg",
              initials: "TA",
              content:
                "我经常上传 3-4 小时直播回放，Link2Posts 每次都能找到精华片段。使用生成的线程后，X 互动翻了三倍。",
              rating: 5,
            },
          ],
        }
      : {
          title: "Loved by creators",
          subtitle: "Join thousands of creators maximizing their reach with Link2Posts",
          testimonials: [
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
          ],
        }

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">{copy.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.testimonials.map((testimonial, index) => (
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
