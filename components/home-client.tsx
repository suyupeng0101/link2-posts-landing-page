"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ResultPreviewSection } from "@/components/result-preview-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

type GenerationOutputs = {
  x_thread: Array<{ order: number; text: string }>
  x_singles: Array<{ angle: string; text: string }>
  youtube_seo: {
    titles: string[]
    description: string
    chapters: Array<{ timestamp: string; title: string }>
    tags: string[]
  }
}

export function HomeClient() {
  const [outputs, setOutputs] = useState<GenerationOutputs | undefined>(undefined)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection onGenerated={setOutputs} />
        <ResultPreviewSection outputs={outputs} />
        <HowItWorksSection />
        <FeaturesSection />
        <UseCasesSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
