/**
 * OpenRouter API wrapper
 * Replaces @anthropic-ai/sdk — no SDK dependency needed.
 * Supports dual model tiers: quality (writer/editor) and cheap (seo/outline).
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';

export async function callClaude({ system, user, maxTokens = 4096, tier = 'quality' }) {
  const model = tier === 'cheap'
    ? (process.env.MODEL_CHEAP   || 'anthropic/claude-haiku-4-5-20251001')
    : (process.env.MODEL_QUALITY || 'anthropic/claude-sonnet-4-5');

  const res = await fetch(OPENROUTER_BASE, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer':  process.env.AUTHOR_SITE || 'https://bhanuprakashsfdc.com',
      'X-Title':       'SFDC Blog Engine',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
    }),
  });

  const data = await res.json();

  // Debug: log raw response for troubleshooting
  console.log('DEBUG - Raw model response:', data);

  if (data.error) throw new Error(`OpenRouter [${model}]: ${data.error.message}`);
  
  // Handle case where content is null but reasoning exists
  let content = data.choices?.[0]?.message?.content;
  if (!content && data.choices?.[0]?.message?.reasoning) {
    // Extract JSON from reasoning text as fallback
    const reasoning = data.choices[0].message.reasoning;
    const match = reasoning.match(/\{[\s\S]*\}/);
    if (match) {
      console.log('DEBUG - Extracted JSON from reasoning');
      return match[0];
    }
  }
  
  if (!content) {
    throw new Error(`OpenRouter: unexpected response — ${JSON.stringify(data)}`);
  }

  return content;
}
