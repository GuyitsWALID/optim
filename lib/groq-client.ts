import { Groq } from 'groq-sdk'

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Types for recommendations
export interface UsagePattern {
  endpoint: string
  avgTokens: number
  requestCount: number
  totalCost: number
  model: string
}

export interface RecommendationRequest {
  organizationId: string
  usagePatterns: UsagePattern[]
  totalSpend: number
  topModels: { model: string; cost: number; requests: number }[]
  topProviders: { provider: string; cost: number }[]
}

export interface Recommendation {
  id: string
  type: 'prompt_optimization' | 'model_selection' | 'caching' | 'batch_processing' | 'context_trimming'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedSavings?: number
  implementationEffort?: 'low' | 'medium' | 'high'
  details?: Record<string, unknown>
}

// System prompt for the recommendation engine
const RECOMMENDATION_SYSTEM_PROMPT = `You are an AI cost optimization expert specializing in LLM (Large Language Model) cost reduction. Your role is to analyze usage patterns and provide actionable, specific recommendations to reduce AI spending.

For each recommendation, you must:
1. Identify the specific optimization opportunity
2. Estimate potential savings (as a percentage or dollar amount)
3. Provide implementation difficulty (low/medium/high)
4. Give concrete, implementable suggestions

Analyze the following usage data and provide recommendations in JSON format.`

// Generate AI recommendations based on usage patterns
export async function generateRecommendations(data: RecommendationRequest): Promise<Recommendation[]> {
  const prompt = `
## Organization Usage Data

### Overall Metrics
- Total Spend: $${data.totalSpend.toFixed(2)}
- Number of unique endpoints analyzed: ${data.usagePatterns.length}

### Top Models by Cost
${data.topModels.map(m => `- ${m.model}: $${m.cost.toFixed(2)} (${m.requests} requests)`).join('\n')}

### Top Providers by Cost
${data.topProviders.map(p => `- ${p.provider}: $${p.cost.toFixed(2)}`).join('\n')}

### Usage Patterns (Endpoints)
${data.usagePatterns.map(p => `
#### ${p.endpoint}
- Model: ${p.model}
- Requests: ${p.requestCount}
- Avg Tokens/Request: ${p.avgTokens}
- Total Cost: $${p.totalCost.toFixed(2)}
`).join('\n')}

## Your Task

Provide exactly 5 recommendations as a JSON array with this exact structure:
[
  {
    "type": "prompt_optimization" | "model_selection" | "caching" | "batch_processing" | "context_trimming",
    "priority": "high" | "medium" | "low",
    "title": "Short descriptive title",
    "description": "Detailed explanation of the opportunity",
    "estimatedSavings": number (percentage, e.g., 30 for 30%),
    "implementationEffort": "low" | "medium" | "high",
    "details": { "specificAction": "description", ... }
  }
]

Prioritize recommendations that:
1. Have highest potential savings
2. Are practical to implement
3. Won't significantly impact quality

Return ONLY valid JSON, no other text.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: RECOMMENDATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from Groq')
    }

    const recommendations = JSON.parse(response)
    return Array.isArray(recommendations) ? recommendations : recommendations.recommendations || []
  } catch (error) {
    console.error('Error generating recommendations:', error)
    // Return fallback recommendations if Groq fails
    return getFallbackRecommendations(data)
  }
}

// Fallback recommendations when Groq is unavailable
function getFallbackRecommendations(data: RecommendationRequest): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Check for expensive models that could be swapped
  const expensiveModels = data.topModels.filter(m => m.cost > data.totalSpend * 0.3)
  if (expensiveModels.length > 0) {
    recommendations.push({
      id: 'fallback-model',
      type: 'model_selection',
      priority: 'high',
      title: 'Consider cheaper alternatives for high-cost models',
      description: `You are spending ${((expensiveModels[0].cost / data.totalSpend) * 100).toFixed(0)}% of your budget on ${expensiveModels[0].model}. Consider using a cheaper model for non-critical tasks.`,
      estimatedSavings: 30,
      implementationEffort: 'low',
      details: { model: expensiveModels[0].model },
    })
  }

  // Check for potential caching opportunities
  const highFrequencyEndpoints = data.usagePatterns.filter(p => p.requestCount > 100)
  if (highFrequencyEndpoints.length > 0) {
    recommendations.push({
      id: 'fallback-cache',
      type: 'caching',
      priority: 'medium',
      title: 'Enable caching for frequently called endpoints',
      description: `${highFrequencyEndpoints.length} endpoints are called frequently and could benefit from response caching.`,
      estimatedSavings: 20,
      implementationEffort: 'medium',
      details: { endpoints: highFrequencyEndpoints.map(p => p.endpoint) },
    })
  }

  // Check for high token usage
  const highTokenEndpoints = data.usagePatterns.filter(p => p.avgTokens > 5000)
  if (highTokenEndpoints.length > 0) {
    recommendations.push({
      id: 'fallback-context',
      type: 'context_trimming',
      priority: 'medium',
      title: 'Optimize context length',
      description: `${highTokenEndpoints.length} endpoints have high average token counts. Consider trimming prompts or using summarize-and-chunk approaches.`,
      estimatedSavings: 15,
      implementationEffort: 'medium',
      details: { endpoints: highTokenEndpoints.map(p => p.endpoint) },
    })
  }

  return recommendations
}

// Analyze request complexity for auto-routing
export async function analyzeRequestComplexity(
  prompt: string,
  messages?: { role: string; content: string }[]
): Promise<'simple' | 'moderate' | 'complex'> {
  const textToAnalyze = messages
    ? messages.map(m => m.content).join(' ')
    : prompt

  // Simple heuristics-based analysis
  const wordCount = textToAnalyze.split(/\s+/).length

  // Check for complex indicators
  const hasComplexIndicators = /\b(analyze|compare|explain in detail|write a comprehensive|create a detailed|evaluate|assess|review)\b/i.test(textToAnalyze)
  const hasSimpleIndicators = /\b(summarize|translate|fix|check|what is|when did|who is)\b/i.test(textToAnalyze)

  if (wordCount < 50 && !hasComplexIndicators) {
    return 'simple'
  } else if (wordCount > 500 || hasComplexIndicators) {
    return 'complex'
  } else if (hasSimpleIndicators && wordCount < 100) {
    return 'simple'
  }

  return 'moderate'
}
