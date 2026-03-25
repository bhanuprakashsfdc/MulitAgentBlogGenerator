import { callClaude } from '../tools/claude.js';
import { config } from '../config/config.js';

/**
 * Writer Agent — uses QUALITY tier (claude-sonnet-4-5)
 * Writes the full blog post section by section using the outline.
 */
export async function writerAgent(seoBrief, outline, researchContext) {
  const { author, voiceProfile } = config;

  const systemPrompt = `You are ${author.name}, a ${author.title} with ${author.experience} of Salesforce experience and ${author.certifications}.

YOUR VOICE:
${voiceProfile.style}

STRICT RULES:
- NEVER use these words/phrases: ${voiceProfile.avoid.join(', ')}
- Every technical claim must be accurate — you are a practitioner, not a content writer
- Include real, working Apex/SOQL/LWC/JSON code when applicable — not pseudo-code
- Write for practitioners who will immediately try to implement what you describe
- Callouts (Pro Tip / Gotcha) must be from real experience, not obvious statements

MARKDOWN FORMAT:
- Use ## for H2, ### for H3
- Wrap code in \`\`\`apex, \`\`\`soql, \`\`\`javascript, \`\`\`json as appropriate
- Use > for callout boxes, prefixed with 🔴 Gotcha:, 💡 Pro Tip:, or ⚠️ Warning:
- Bold key terms on first use

You are writing for: ${voiceProfile.audience}`;

  const sections = [];

  // Intro — quality tier
  const intro = await callClaude({
    system: systemPrompt,
    user: `Write the INTRODUCTION for this blog post.

Title: ${seoBrief.title}
Primary keyword to naturally include: ${seoBrief.primaryKeyword}
Hook to use: ${outline.intro.hook}
Problem to establish: ${outline.intro.problemStatement}
Target word count: ${outline.intro.wordCount} words

Write ONLY the introduction — no title, no headers. Start directly with the hook.
End with a clear statement of what the reader will learn.`,
    maxTokens: 2048,
    tier: 'quality',
  });
  sections.push(intro);

  // Each section — quality tier
  for (const section of outline.sections) {
    const codeInstruction = section.includeCode
      ? `Include a real working code example in ${section.codeLanguage}. The code must be production-ready, not a stub.`
      : 'No code block needed for this section.';

    const calloutInstruction = section.callout && section.callout !== 'null'
      ? `End with a ${section.callout} callout: "${section.calloutText}" — format as "> ${section.callout === 'Pro Tip' ? '💡 Pro Tip:' : section.callout === 'Gotcha' ? '🔴 Gotcha:' : '⚠️ Warning:'} [your callout]"`
      : '';

    const sectionContent = await callClaude({
      system: systemPrompt,
      user: `Write the section with heading "## ${section.h2}" for the article "${seoBrief.title}".

Key points to cover:
${section.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${codeInstruction}
${calloutInstruction}

Research context available:
${researchContext}

LSI keywords to naturally weave in: ${seoBrief.lsiKeywords.slice(0, 3).join(', ')}
Target word count: ${section.wordCount} words

Start directly with "## ${section.h2}" — do not add any preamble.`,
      maxTokens: 3000,
      tier: 'quality',
    });

    sections.push(sectionContent);
  }

  // Conclusion — quality tier
  const conclusion = await callClaude({
    system: systemPrompt,
    user: `Write the CONCLUSION for "${seoBrief.title}".

Main takeaway to drive home: ${outline.conclusion.mainTakeaway}
CTA: ${outline.conclusion.cta}
Author site: ${author.site}
Author LinkedIn: ${author.linkedin}

Target word count: ${outline.conclusion.wordCount} words
Start with "## Final Thoughts" or "## The Bottom Line".`,
    maxTokens: 2048,
    tier: 'quality',
  });
  sections.push(conclusion);

  return sections.join('\n\n');
}
