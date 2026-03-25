/**
 * Web Research Tool — uses Tavily for live web search
 * Returns context from search results + extracted content.
 */

const TAVILY_BASE = 'https://api.tavily.com/search';

export async function researchTopic(topic) {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey || apiKey === 'tvly-your-key-here') {
    return 'No Tavily API key configured. Using internal knowledge only.';
  }

  try {
    const res = await fetch(TAVILY_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: topic,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return `No web results found for: ${topic}`;
    }

    // Format results as research context
    const context = data.results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}\n`)
      .join('\n');

    return `WEB RESEARCH RESULTS:\n\n${context}`;
  } catch (err) {
    console.error('Tavily research error:', err.message);
    return 'Web research unavailable. Using internal knowledge.';
  }
}
