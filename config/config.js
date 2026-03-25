export const config = {
  author: {
    name:           process.env.AUTHOR_NAME,
    title:          process.env.AUTHOR_TITLE,
    linkedin:       process.env.AUTHOR_LINKEDIN,
    site:           process.env.AUTHOR_SITE,
    niche:          process.env.BLOG_NICHE,
    experience:     process.env.AUTHOR_EXPERIENCE,
    certifications: process.env.AUTHOR_CERTIFICATIONS,
  },

  // ── Model tiers ────────────────────────────────────────────────────────────
  // cheap   → SEO agent, Outline agent   (fast JSON tasks, ~70% cost saving)
  // quality → Writer agent, Editor agent (content quality matters here)
  models: {
    quality: process.env.MODEL_QUALITY,
    cheap:   process.env.MODEL_CHEAP,
  },

  // ── Pre-seeded Salesforce topic queue ─────────────────────────────────────
  topicQueue: [
    { keyword: 'Agentforce vs Einstein Copilot differences',              difficulty: 'medium', intent: 'informational' },
    { keyword: 'Salesforce Financial Services Cloud implementation guide', difficulty: 'low',    intent: 'informational' },
    { keyword: 'Apex trigger framework best practices 2025',              difficulty: 'medium', intent: 'informational' },
    { keyword: 'Salesforce Data Cloud vs Marketing Cloud CDP',            difficulty: 'medium', intent: 'comparison'    },
    { keyword: 'LWC vs Aura components when to use',                     difficulty: 'low',    intent: 'comparison'    },
    { keyword: 'Salesforce MuleSoft integration patterns',               difficulty: 'medium', intent: 'how-to'        },
    { keyword: 'Agentforce custom actions tutorial',                     difficulty: 'low',    intent: 'tutorial'      },
    { keyword: 'Salesforce Platform Events vs Change Data Capture',      difficulty: 'medium', intent: 'comparison'    },
    { keyword: 'FFLIB Apex common patterns explained',                   difficulty: 'low',    intent: 'tutorial'      },
    { keyword: 'Salesforce Health Cloud implementation checklist',       difficulty: 'low',    intent: 'informational' },
  ],

  // ── Voice fingerprint ─────────────────────────────────────────────────────
  voiceProfile: {
    tone:      'Practitioner-first. No fluff. Write like someone who has rescued failed implementations.',
    avoid:     [
      "In today's fast-paced world", 'game-changer', 'leverage', 'delve',
      'Furthermore', 'Moreover', 'utilize', 'In conclusion', 'transformative',
      'cutting-edge', 'seamlessly', 'robust', 'unlock', 'elevate',
    ],
    style:     'Mix short punchy sentences with deeper analytical paragraphs. Use real code. Call out gotchas. End sections with a "Pro Tip" or "Gotcha" callout.',
    audience:  'Salesforce architects, senior developers, CTOs evaluating Salesforce, and junior devs leveling up.',
    format:    'Start with a hook (problem statement or surprising fact). Use H2/H3 structure. Include code blocks. End with a concrete takeaway.',
    wordCount: { min: 1500, max: 2500 },
  },

  outputDir: './output',
};
