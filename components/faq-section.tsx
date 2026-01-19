/*
 * @Description: 
 * @Version: 1.0
 * @Autor: pawn
 * @Date: 2026-01-13 15:57:25
 * @LastEditors: pawn
 * @LastEditTime: 2026-01-19 21:11:10
 */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "阶段 1 支持哪些输入？",
      answer: "仅支持 YouTube URL 输入，暂不支持本地上传或 X 链接。",
    },
    {
      question: "必须登录才能生成吗？",
      answer: "是的。需要通过邮箱登录后才能开始生成（目前只支持Google邮箱）。",
    },
    {
      question: "生成的内容包含哪些类型？",
      answer: "固定输出三类资产：X Thread、单条推文、YouTube SEO 元数据。",
    },
    {
      question: "生成时长大概多久？",
      answer: "多数视频在 2 分钟内完成，具体取决于视频长度与转录情况。",
    },
    {
      question: "支持哪些导出方式？",
      answer: "结果页支持一键复制，也可导出 Markdown 或 JSON。",
    },
    {
      question: "如果生成失败会怎样？",
      answer: "会给出明确的失败原因（如抓取失败、无字幕或超时）。",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">常见问题</h2>
            <p className="text-lg text-muted-foreground">阶段 1 最常见的问题解答</p>
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
