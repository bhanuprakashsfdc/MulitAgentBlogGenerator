import { callClaude } from '../tools/claude.js';
import { config } from '../config/config.js';

/**
 * SEO Research Agent
 * Takes a raw topic/keyword and returns:
 *  - Primary keyword
 *  - 5 LSI/semantic keywords
 *  - Recommended title (60 chars)
 *  - Meta description (155 chars)
 *  - Search intent classification
 *  - Competitor angle gap (what most articles miss)
 */
export async function seoResearchAgent(topic) {
  const system = `You are an expert SEO strategist specialising in Salesforce technical content.
You understand search intent, keyword clustering, and what Salesforce practitioners actually Google.
Always respond with valid JSON only — no markdown, no explanation.`;

  const user = `Analyse this topic for SEO optimisation:
Topic: "${topic}"
Niche: ${config.author.niche}
Target audience: ${config.voiceProfile.audience}

Return a JSON object with exactly these fields:
{
  "primaryKeyword": "exact phrase to target",
  "lsiKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "title": "SEO-optimised blog title under 60 characters",
  "metaDescription": "Compelling meta description under 155 characters with the primary keyword",
  "slug": "url-slug-for-this-post",
  "searchIntent": "informational | comparison | tutorial | how-to",
  "contentGap": "What most articles on this topic miss that we should cover",
  "estimatedWordCount": 1800,
  "targetHeaders": ["H2 section 1", "H2 section 2", "H2 section 3", "H2 section 4"]
}`;

  const raw = await callClaude({ system, user, maxTokens: 4096, tier: 'cheap' });

  try {
    return JSON.parse(raw.trim());
  } catch {
    // Attempt to extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('SEO Agent: Could not parse JSON response');
  }
}
