# SFDC Blog Engine v2.0 🤖

> Autonomous 5-agent Salesforce blog pipeline — powered by **OpenRouter**.
> Node.js · No heavy SDKs · Dual model tiers · Markdown + HTML output · Daily scheduler

---

## What Changed in v2 (OpenRouter edition)

| v1 (Anthropic SDK) | v2 (OpenRouter) |
|---|---|
| `@anthropic-ai/sdk` dependency | Raw `fetch()` — no SDK needed |
| Single model for all agents | **Dual tier**: cheap for JSON, quality for writing |
| `ANTHROPIC_API_KEY` | `OPENROUTER_API_KEY` |
| Locked to Claude | Swap any model via env var |

---

## Model Tiers — ~70% Cost Saving

| Tier | Agents | Default Model | Why |
|---|---|---|---|
| **cheap** | SEO Research, Outline | `claude-haiku-4-5-20251001` | Fast JSON tasks — speed over depth |
| **quality** | Writer, Editor/QA | `claude-sonnet-4-5` | Content quality matters here |

Override anytime in `.env`:
```bash
MODEL_QUALITY=nvidia/nemotron-3-super-120b-a12b:free
MODEL_CHEAP=nvidia/nemotron-3-super-120b-a12b:free
```

---

## Pipeline

```
Topic input
    │
    ▼
Agent 1: SEO Research    [cheap tier]  → keyword, title, slug, meta, content gap
    │
    ▼
Agent 2: Web Research                  → Tavily sources or training knowledge
    │
    ▼
Agent 3: Outline         [cheap tier]  → section blueprint with code/callout flags
    │
    ▼
Agent 4: Writer          [quality tier]→ full post in your voice, section by section
    │
    ▼
Agent 5: Editor / QA     [quality tier]→ slop removal, keyword density, quality score
    │
    ▼
Publisher                              → /output/{slug}.md + /output/{slug}.html
```

---

## Installation

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher

### Step-by-Step Setup

```bash
# 1. Clone or navigate to the project
cd MulitAgentBlogGenerator

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Configure your API keys
# Edit .env and set:
# OPENROUTER_API_KEY=sk-or-...
# (Get your key from https://openrouter.ai/settings)

# 5. Optionally customize models
# Default models are set in .env, but you can override:
# MODEL_QUALITY=claude-sonnet-4-5
# MODEL_CHEAP=claude-haiku-4-5-20251001
```

---

## Usage

### Basic Usage

```bash
# Generate a single blog post
node index.js "Your blog topic here"

# Example:
node index.js "Agentforce custom actions tutorial"
```

### Advanced Usage

```bash
# Run batch processing - all topics in config queue
npm run batch

# Daily scheduler (runs at 6:00 AM IST)
npm run schedule

# Run scheduler immediately
npm run run-now
```

### Output

Generated blog posts will be saved to the `output/` directory:
- `output/{slug}.md` - Markdown with YAML frontmatter
- `output/{slug}.html` - Styled HTML with SEO metadata

---

## Output Files

| File | Purpose |
|---|---|
| `output/{slug}.md` | YAML frontmatter + Markdown — Jekyll/Hugo/Astro ready |
| `output/{slug}.html` | Standalone HTML with full styling, Schema.org, OG tags |

---

## Project Structure

```
sfdc-blog-engine/
├── agents/
│   ├── seoAgent.js          → Agent 1: keyword, title, slug, meta  [cheap]
│   ├── outlineAgent.js      → Agent 3: section blueprint           [cheap]
│   ├── writerAgent.js       → Agent 4: full content generation     [quality]
│   ├── editorAgent.js       → Agent 5: QA + slop removal          [quality]
│   └── publisherAgent.js   → file writer (no API call)
├── tools/
│   ├── claude.js            → OpenRouter wrapper (dual-tier)
│   └── research.js          → Tavily web research
├── config/
│   └── config.js            → topics, models, voice, author info
├── output/                  → generated .md and .html files
├── index.js                 → main orchestrator
├── scheduler.js             → cron scheduler
└── .env.example
```

---

## Supported OpenRouter Models

Any model on https://openrouter.ai/models works. Recommended:

| Use case | Model string |
|---|---|
| Best quality writing | `nvidia/nemotron-3-super-120b-a12b:free` |
| Fast + cheap JSON | `nvidia/nemotron-3-super-120b-a12b:free` |
| GPT alternative | `nvidia/nemotron-3-super-120b-a12b:free` |
| Free option | `nvidia/nemotron-3-super-120b-a12b:free` |

---

Built for **Bhanu Prakash Kollireddy** · bhanuprakashsfdc.com
