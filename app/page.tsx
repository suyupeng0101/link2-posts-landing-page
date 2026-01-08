import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ResultPreviewSection } from "@/components/result-preview-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ResultPreviewSection />
        <HowItWorksSection />
        <FeaturesSection />
        <UseCasesSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
