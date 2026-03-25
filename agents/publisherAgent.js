/**
 * Publisher Agent
 * Writes the final blog post to output files (Markdown + HTML).
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';
import matter from 'gray-matter';
import { marked } from 'marked';

const OUTPUT_DIR = config.outputDir || './output';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Publish the blog post to Markdown and HTML files.
 * 
 * @param {Object} params
 * @param {string} params.content - The markdown content
 * @param {Object} params.seoBrief - SEO data from seoAgent
 * @param {Object} params.author - Author info from config
 */
export async function publishPost({ content, seoBrief, author }) {
  const slug = seoBrief.slug;
  const date = new Date().toISOString().split('T')[0];

  // ─── Frontmatter for Jekyll/Hugo/Astro ─────────────────────────────────────
  const frontmatter = {
    title: seoBrief.title,
    description: seoBrief.metaDescription,
    date: date,
    author: author.name,
    keywords: seoBrief.lsiKeywords,
    slug: slug,
    categories: ['Salesforce', 'Financial Services Cloud'],
    layout: 'post',
  };

  // Build full markdown with frontmatter
  const mdContent = matter.stringify(content, frontmatter);

  // ─── Write Markdown file ─────────────────────────────────────────────────
  const mdPath = path.join(OUTPUT_DIR, `${slug}.md`);
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  // ─── Generate HTML file ─────────────────────────────────────────────────
  const htmlContent = generateHtml({ 
    title: seoBrief.title, 
    content, 
    seoBrief, 
    author, 
    date 
  });
  
  const htmlPath = path.join(OUTPUT_DIR, `${slug}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log(`📄 Published: ${slug}.md`);
  console.log(`📄 Published: ${slug}.html`);
}

/**
 * Generate a standalone HTML file with full styling and SEO metadata.
 */
function generateHtml({ title, content, seoBrief, author, date }) {
  const htmlBody = marked(content);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${seoBrief.metaDescription}">
  <meta name="keywords" content="${seoBrief.lsiKeywords.join(', ')}">
  <meta name="author" content="${author.name}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${seoBrief.metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${author.site}/${seoBrief.slug}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${seoBrief.metaDescription}">
  
  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "author": {
      "@type": "Person",
      "name": "${author.name}",
      "url": "${author.linkedin}"
    },
    "datePublished": "${date}",
    "description": "${seoBrief.metaDescription}",
    "publisher": {
      "@type": "Organization",
      "name": "${author.name}",
      "logo": {
        "@type": "ImageObject",
        "url": "${author.site}/logo.png"
      }
    }
  }
  </script>
  
  <style>
    :root {
      --primary: #00a1e0;
      --secondary: #1798c1;
      --text: #333;
      --bg: #fff;
      --code-bg: #f5f5f5;
      --code-border: #ddd;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    
    h2 {
      font-size: 1.75rem;
      margin: 2rem 0 1rem;
      color: var(--primary);
    }
    
    h3 {
      font-size: 1.25rem;
      margin: 1.5rem 0 0.5rem;
    }
    
    p { margin-bottom: 1rem; }
    
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    code {
      background: var(--code-bg);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    
    pre code {
      background: none;
      padding: 0;
      font-size: 0.85em;
    }
    
    blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #555;
    }
    
    .callout {
      padding: 1rem;
      border-radius: 6px;
      margin: 1.5rem 0;
    }
    
    .pro-tip {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
    }
    
    .gotcha {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    
    .warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    
    .author-info {
      border-top: 1px solid #eee;
      margin-top: 3rem;
      padding-top: 1.5rem;
      font-size: 0.9rem;
      color: #666;
    }
    
    .meta {
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    
    ul, ol { margin: 1rem 0 1rem 1.5rem; }
    li { margin-bottom: 0.5rem; }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <div class="meta">
      By <a href="${author.linkedin}">${author.name}</a> · ${date}
    </div>
  </header>
  
  <article>
    ${htmlBody}
  </article>
  
  <footer class="author-info">
    <p><strong>About the Author:</strong> ${author.title}</p>
    <p>${author.certifications}</p>
    <p><a href="${author.linkedin}">LinkedIn</a> · <a href="${author.site}">Website</a></p>
  </footer>
</body>
</html>`;
}
