import { callClaude } from '../tools/claude.js';
import { config } from '../config/config.js';

const BANNED_PHRASES = config.voiceProfile.avoid;

/**
 * Editor Agent
 * Runs three checks:
 * 1. AI slop detection (banned phrases)
 * 2. Technical accuracy review
 * 3. SEO keyword density check
 * Returns cleaned content + quality report.
 */
export async function editorAgent(content, seoBrief) {
  // --- Pass 1: Slop detection (local, no API call needed) ---
  const slopFound = BANNED_PHRASES.filter((phrase) =>
    content.toLowerCase().includes(phrase.toLowerCase())
  );

  // --- Pass 2: AI polish & rewrite via Claude ---
  const system = `You are a senior technical editor for a Salesforce architecture blog.
Your job is to clean up AI-generated content so it reads like a human practitioner wrote it.
Return ONLY the improved markdown — no explanation, no wrapper text.`;

  const user = `Edit this blog post draft. Make the following improvements:

${slopFound.length > 0 ? `1. REMOVE or REWRITE these AI slop phrases found in the draft: ${slopFound.join(', ')}` : '1. No banned phrases found — good.'}
2. Ensure all code blocks have proper language identifiers (\`\`\`apex, \`\`\`soql, etc.)
3. Verify that callout blocks (Pro Tip / Gotcha) are genuinely insightful — rewrite generic ones
4. Ensure the primary keyword "${seoBrief.primaryKeyword}" appears naturally 3–5 times total
5. Fix any awkward transitions between sections
6. Tighten any paragraph over 5 sentences — break it up or cut
7. Ensure the intro hook is punchy — rewrite if it starts with "In this article" or similar

DRAFT TO EDIT:
${content}

Return the complete edited markdown. Preserve all headings, code blocks, and structure.`;

  const edited = await callClaude({ system, user, maxTokens: 8192, tier: 'quality' });

  // --- Pass 3: Quality report ---
  const wordCount = edited.split(/\s+/).length;
  const keywordCount = (edited.toLowerCase().match(new RegExp(seoBrief.primaryKeyword.toLowerCase(), 'g')) || []).length;
  const hasCode = edited.includes('```');
  const hasCallouts = edited.includes('💡') || edited.includes('🔴') || edited.includes('⚠️');

  const report = {
    wordCount,
    keywordDensity: ((keywordCount / wordCount) * 100).toFixed(2) + '%',
    keywordCount,
    hasCode,
    hasCallouts,
    slopPhrasesCleaned: slopFound,
    qualityScore: calculateQuality({ wordCount, keywordCount, hasCode, hasCallouts, slopFound }),
  };

  return { content: edited, report };
}

function calculateQuality({ wordCount, keywordCount, hasCode, hasCallouts, slopFound }) {
  let score = 100;
  if (wordCount < 1200) score -= 20;
  if (wordCount > 3000) score -= 10;
  if (keywordCount < 2) score -= 15;
  if (keywordCount > 10) score -= 10;
  if (!hasCode) score -= 15;
  if (!hasCallouts) score -= 10;
  score -= slopFound.length * 5;
  return Math.max(0, score) + '/100';
}
