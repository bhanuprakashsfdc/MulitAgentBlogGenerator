/**
 * SFDC Blog Engine v2.0 — Main Entry Point
 * Orchestrates the 5-agent pipeline to generate blog posts.
 * 
 * Usage: node index.js "Your Blog Topic Here"
 *        node index.js --batch (process all topics in config queue)
 */

import { config } from './config/config.js';
import { seoResearchAgent } from './agents/seoAgent.js';
import { outlineAgent } from './agents/outlineAgent.js';
import { writerAgent } from './agents/writerAgent.js';
import { editorAgent } from './agents/editorAgent.js';
import { publishPost } from './agents/publisherAgent.js';
import { researchTopic } from './tools/research.js';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

dotenv.config();

// ══════════════════════════════════════════════════════════════════════════════
// Main Pipeline
// ══════════════════════════════════════════════════════════════════════════════

async function generateBlogPost(topic) {
  const startTime = Date.now();
  
  console.log(chalk.cyan.bold(`\n🚀 Starting blog generation for: "${topic}"\n`));

  // ─── Agent 1: SEO Research ─────────────────────────────────────────────────
  const seoSpinner = ora('🔍 Running SEO Research Agent...').start();
  let seoBrief;
  try {
    seoBrief = await seoResearchAgent(topic);
    seoSpinner.succeed(chalk.green('✓ SEO Research complete'));
    console.log(chalk.gray(`   Primary keyword: ${seoBrief.primaryKeyword}`));
    console.log(chalk.gray(`   Title: ${seoBrief.title}`));
    console.log(chalk.gray(`   Slug: ${seoBrief.slug}`));
  } catch (err) {
    seoSpinner.fail(chalk.red('✗ SEO Research failed'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // ─── Agent 2: Web Research ─────────────────────────────────────────────────
  const researchSpinner = ora('🌐 Running Web Research...').start();
  let researchContext = '';
  try {
    researchContext = await researchTopic(topic);
    researchSpinner.succeed(chalk.green('✓ Web Research complete'));
  } catch (err) {
    researchSpinner.warn(chalk.yellow('⚠ Web Research failed, continuing with internal knowledge'));
    researchContext = 'No external research available. Use your training knowledge.';
  }

  // ─── Agent 3: Outline Generation ────────────────────────────────────────────
  const outlineSpinner = ora('📝 Running Outline Agent...').start();
  let outline;
  try {
    outline = await outlineAgent(seoBrief, researchContext);
    outlineSpinner.succeed(chalk.green('✓ Outline generation complete'));
    console.log(chalk.gray(`   Sections: ${outline.sections.length}`));
  } catch (err) {
    outlineSpinner.fail(chalk.red('✗ Outline generation failed'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // ─── Agent 4: Content Writing ──────────────────────────────────────────────
  const writerSpinner = ora('✍️ Running Writer Agent...').start();
  let draftContent;
  try {
    draftContent = await writerAgent(seoBrief, outline, researchContext);
    writerSpinner.succeed(chalk.green('✓ Content writing complete'));
  } catch (err) {
    writerSpinner.fail(chalk.red('✗ Content writing failed'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // ─── Agent 5: Editor / QA ──────────────────────────────────────────────────
  const editorSpinner = ora('🎯 Running Editor/QA Agent...').start();
  let finalContent;
  let qualityReport;
  try {
    const result = await editorAgent(draftContent, seoBrief);
    finalContent = result.content;
    qualityReport = result.report;
    editorSpinner.succeed(chalk.green('✓ Editor/QA complete'));
    console.log(chalk.gray(`   Quality Score: ${qualityReport.qualityScore}`));
    console.log(chalk.gray(`   Word Count: ${qualityReport.wordCount}`));
    console.log(chalk.gray(`   Keyword Density: ${qualityReport.keywordDensity}`));
  } catch (err) {
    editorSpinner.fail(chalk.red('✗ Editor/QA failed'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // ─── Publisher ──────────────────────────────────────────────────────────────
  const publisherSpinner = ora('💾 Publishing...').start();
  try {
    await publishPost({ 
      content: finalContent, 
      seoBrief, 
      author: config.author 
    });
    publisherSpinner.succeed(chalk.green('✓ Post published'));
  } catch (err) {
    publisherSpinner.fail(chalk.red('✗ Publishing failed'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(chalk.cyan.bold(`\n✅ Blog post generated in ${elapsed}s`));
  console.log(chalk.gray(`   Output: output/${seoBrief.slug}.md`));
  console.log(chalk.gray(`   Output: output/${seoBrief.slug}.html`));
  console.log(chalk.gray(`   Quality Score: ${qualityReport.qualityScore}\n`));
}

// ══════════════════════════════════════════════════════════════════════════════
// CLI Handler
// ══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.includes('--batch')) {
  console.log(chalk.yellow('📚 Batch mode: Processing all topics in queue...\n'));
  
  (async () => {
    for (const topic of config.topicQueue) {
      await generateBlogPost(topic.keyword);
      console.log(chalk.gray('─'.repeat(60)));
    }
  })();
} else if (args.length === 0) {
  console.log(chalk.yellow('Usage: node index.js "Your Blog Topic"'));
  console.log(chalk.yellow('       node index.js --batch'));
  process.exit(1);
} else {
  const topic = args.join(' ');
  generateBlogPost(topic).catch(err => {
    console.error(chalk.red('Fatal error:'), err);
    process.exit(1);
  });
}
