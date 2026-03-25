import { callClaude } from '../tools/claude.js';
import { config } from '../config/config.js';

/**
 * Outline Agent
 * Takes SEO brief + research context and returns a detailed section-by-section outline.
 * Each section has a word count target and key points to cover.
 */
export async function outlineAgent(seoBrief, researchContext) {
  const system = `You are a senior Salesforce content strategist.
You write outlines that result in blog posts practitioners actually bookmark — not shallow SEO filler.
Always respond with valid JSON only — no markdown fences, no preamble.`;

  const user = `Create a detailed blog outline for this Salesforce topic.

SEO BRIEF:
- Primary Keyword: ${seoBrief.primaryKeyword}
- Title: ${seoBrief.title}
- Search Intent: ${seoBrief.searchIntent}
- Content Gap to address: ${seoBrief.contentGap}
- Target headers from SEO: ${seoBrief.targetHeaders.join(', ')}

RESEARCH CONTEXT:
${researchContext}

VOICE PROFILE:
- Audience: ${config.voiceProfile.audience}
- Style: ${config.voiceProfile.style}
- Total word count: ${config.voiceProfile.wordCount.min}–${config.voiceProfile.wordCount.max} words

Return JSON with this structure:
{
  "intro": {
    "hook": "Opening line or stat that grabs the reader",
    "problemStatement": "The core problem this article solves",
    "wordCount": 150
  },
  "sections": [
    {
      "h2": "Section title",
      "keyPoints": ["point 1", "point 2", "point 3"],
      "includeCode": true,
      "codeLanguage": "apex | soql | javascript | json | bash",
      "callout": "Pro Tip | Gotcha | Warning | null",
      "calloutText": "The callout content if applicable",
      "wordCount": 400
    }
  ],
  "conclusion": {
    "mainTakeaway": "The single most important thing the reader should remember",
    "cta": "What the reader should do next (check bhanuprakashsfdc.com, follow on LinkedIn, etc.)",
    "wordCount": 150
  }
}`;

  const raw = await callClaude({ system, user, maxTokens: 4096, tier: 'cheap' });

  try {
    return JSON.parse(raw.trim());
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Outline Agent: Could not parse JSON response');
  }
}
