/**
 * Batch-processes Job Opportunities in Notion that have status "Not Started"
 * and no existing analysis section.
 *
 * JD source priority for each opportunity:
 *   1. Job Post URL — fetched via ATS-specific APIs (Ashby, Greenhouse, Lever) or HTML scrape
 *   2. Notion page body — if URL is missing or fails, reads JD text from page blocks
 *      (put the JD under a "Job Description" heading in the Notion page)
 *
 * Usage:
 *   npm run jobs:process          — process all unanalyzed opportunities
 *   npm run jobs:dry-run          — preview without writing to Notion
 *   npm run jobs:reprocess        — force-regenerate all (appends new section)
 */

import {
  getOpportunitiesForProcessing,
  hasExistingAnalysis,
  readJdFromNotionPage,
  cleanAnalysisBlocks,
  updateOpportunityScore,
} from '../lib/notion/client';
import { generateApplicationMaterials } from '../lib/agent/tools/generateApplicationMaterials';

const isDryRun = process.argv.includes('--dry-run');
const isForce = process.argv.includes('--force');
const isClean = process.argv.includes('--clean');

async function main() {
  console.log(`\n🕵️  Job Opportunity Processor${isDryRun ? ' (DRY RUN)' : ''}\n`);

  const opportunities = await getOpportunitiesForProcessing();
  console.log(`Found ${opportunities.length} opportunity/ies with status "Not Started"\n`);

  if (opportunities.length === 0) {
    console.log('Nothing to process.');
    return;
  }

  let processed = 0;
  let skipped = 0;
  let errored = 0;

  for (const opp of opportunities) {
    console.log(`──────────────────────────────────────`);
    console.log(`📋 ${opp.title}`);
    console.log(`   Notion: ${opp.notionUrl}`);

    // Skip if analysis already exists (unless --force or --clean)
    const alreadyAnalyzed = await hasExistingAnalysis(opp.id);
    if (alreadyAnalyzed && !isForce && !isClean) {
      console.log(`   ✅ Analysis already exists — skipping (use --force to append, --clean to replace)\n`);
      skipped++;
      continue;
    }

    if (alreadyAnalyzed && isClean) {
      if (isDryRun) {
        console.log(`   🧹 Would delete existing analysis blocks (dry run)`);
      } else {
        const deleted = await cleanAnalysisBlocks(opp.id);
        console.log(`   🧹 Cleared ${deleted} existing analysis block(s)`);
      }
    } else if (alreadyAnalyzed && isForce) {
      console.log(`   ⚠️  Existing analysis found — appending new section (--force)`);
    }

    // Resolve JD source: Notion page body takes priority (manually curated),
    // then ATS URL, then generic URL scrape.
    let jdSource: { jobUrl?: string; jobDescription?: string; sourceLabel: string };

    const pageJd = await readJdFromNotionPage(opp.id);
    if (pageJd) {
      console.log(`   📄 Using JD from Notion page body (${pageJd.length} chars)`);
      if (opp.jobPostUrl) console.log(`   🔗 ${opp.jobPostUrl} (URL present but page body takes priority)`);
      jdSource = { jobDescription: pageJd, sourceLabel: 'Notion page' };
    } else if (opp.jobPostUrl) {
      console.log(`   🔗 ${opp.jobPostUrl}`);
      jdSource = { jobUrl: opp.jobPostUrl, sourceLabel: 'URL' };
    } else {
      console.log(`   ❌ No JD found — add a Job Post URL or paste the JD under a "Job Description" heading in the Notion page\n`);
      skipped++;
      continue;
    }

    if (isDryRun) {
      console.log(`   🔍 Would generate materials from ${jdSource.sourceLabel} (dry run)\n`);
      processed++;
      continue;
    }

    console.log(`   ⏳ Generating materials from ${jdSource.sourceLabel}...`);
    const result = await generateApplicationMaterials({
      jobUrl: jdSource.jobUrl,
      jobDescription: jdSource.jobDescription,
      opportunityTitle: opp.title,
      notionPageId: opp.id,
    });

    if (result.ok) {
      await updateOpportunityScore(opp.id, result.data.fitScore);
      console.log(
        `   ✅ Done — fit score ${result.data.fitScore}/100 · status → Fit Scored\n`,
      );
      processed++;
    } else {
      console.log(`   ❌ Error: ${result.error}\n`);
      errored++;
    }
  }

  console.log(`──────────────────────────────────────`);
  console.log(`\nSummary: ${processed} processed · ${skipped} skipped · ${errored} errored\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
