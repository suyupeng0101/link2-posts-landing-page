import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "What video links and formats are supported?",
      answer:
        "We support YouTube video links (including live stream replays), X video links (beta), and direct file uploads in MP4, MOV, and MP3 formats. Maximum file size is 500MB.",
    },
    {
      question: "Are there limitations on X video links?",
      answer:
        "X video link support is currently in beta. Some private or restricted videos may not be accessible. We recommend uploading the video file directly if you encounter issues. Full X integration is coming soon.",
    },
    {
      question: "Do I need to log in to use Link2Posts?",
      answer:
        "You can paste links and upload files without logging in, but you must create a free account (via email magic link) to start generating content. This helps us manage credits and save your generated assets.",
    },
    {
      question: "How are credits calculated?",
      answer:
        "Credits are charged in two parts: (1) Transcription costs 2 credits per minute of video, and (2) Content generation costs 6 credits for the complete asset package. If your video has subtitles or we've cached the transcript, transcription is free!",
    },
    {
      question: "What happens to my video and data?",
      answer:
        "We take privacy seriously. Videos are processed securely and never shared. Transcripts and generated content are stored encrypted. You can delete your content anytime from your dashboard. We never train AI models on your content.",
    },
    {
      question: "How long does processing take?",
      answer:
        "Most videos are processed in under 2 minutes. Processing time depends on video length—a 10-minute video typically takes 60-90 seconds, while a 1-hour video might take 5-8 minutes.",
    },
    {
      question: "What formats can I export content in?",
      answer:
        "All content can be copied directly with one click. Paid plans also support exporting your complete asset package as PDF or JSON files for archiving or integration with other tools.",
    },
    {
      question: "What if a generation fails or I'm unsatisfied?",
      answer:
        "If a generation fails due to an error on our end, credits are automatically refunded. For quality issues, contact our support team—we review each case individually and often provide free re-generations or credit refunds.",
    },
    {
      question: "Can I try it before paying?",
      answer:
        "Yes! Every new account gets 20 free credits (enough for ~5 minutes of video + 1-2 generations). No credit card required. Upgrade anytime to get more credits.",
    },
    {
      question: "Do credits expire?",
      answer:
        "No, credits never expire. Buy them once and use them whenever you need. Your generated content storage duration depends on your plan (7 days for Free, 30 days for Starter, forever for Creator and Pro).",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about Link2Posts</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
