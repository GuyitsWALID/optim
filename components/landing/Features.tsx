'use client'

import { BarChart3, Sparkles, ArrowLeftRight, TrendingUp, Bell, Code } from "lucide-react"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"

const featureTimeline = [
  {
    id: 1,
    title: "Cost Tracking",
    date: "Real-time",
    content: "Monitor every API call, token, and dollar in real time. Get per-model, per-provider, and per-project breakdowns so you always know where your budget goes.",
    category: "Visibility",
    icon: BarChart3,
    relatedIds: [2, 5],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "AI Recommendations",
    date: "Automated",
    content: "Optim analyzes your usage patterns and recommends specific model swaps, prompt optimizations, and caching strategies — each with a confidence score and estimated savings.",
    category: "Intelligence",
    icon: Sparkles,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Smart Routing",
    date: "Automatic",
    content: "Automatically route queries to the optimal model based on complexity, latency, and cost — without changing a single line of your application code.",
    category: "Optimization",
    icon: ArrowLeftRight,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 4,
    title: "Benchmarking",
    date: "Industry",
    content: "See how your AI spend compares to anonymized peers in your industry. Spot where you are overpaying relative to similar teams and workloads.",
    category: "Analytics",
    icon: TrendingUp,
    relatedIds: [3, 5],
    status: "completed" as const,
    energy: 80,
  },
  {
    id: 5,
    title: "Alerts & Budgets",
    date: "Real-time",
    content: "Set per-project or org-wide spending limits with real-time alerts. Get notified the moment costs approach your threshold — never get surprised by a runaway bill.",
    category: "Control",
    icon: Bell,
    relatedIds: [1, 6],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 6,
    title: "Drop-in SDK",
    date: "2 min setup",
    content: "Two lines of code. Wrap your existing OpenAI-compatible client with wrapOpenAI() and Optim handles the rest — zero vendor lock-in, works with 50+ providers.",
    category: "Integration",
    icon: Code,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 95,
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 md:py-32 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[var(--foreground)] mb-4">
            Everything you need to cut AI costs
          </h2>
          <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            From real-time visibility to AI-driven optimization — click each node to explore the complete toolkit.
          </p>
        </div>

        {/* Orbital timeline */}
        <RadialOrbitalTimeline timelineData={featureTimeline} />
      </div>
    </section>
  )
}
