import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Optim - AI Model Cost Optimization Platform',
  description: 'Reduce your LLM costs by up to 85% with Optim. Track, analyze, and automatically optimize AI spending across OpenAI, Anthropic, Google, and more.',
  keywords: ['AI cost optimization', 'LLM cost tracking', 'reduce AI spend', 'OpenAI cost', 'Anthropic cost', 'ChatGPT cost management'],
  authors: [{ name: 'Optim' }],
  openGraph: {
    title: 'Optim - AI Model Cost Optimization',
    description: 'Reduce LLM costs by up to 85% with intelligent tracking and optimization.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Optim',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optim - AI Model Cost Optimization',
    description: 'Reduce LLM costs by up to 85% with intelligent tracking and optimization.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://optim.ai" />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
