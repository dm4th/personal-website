import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import type { EligibilityCase } from '../lib/projects/dental-eligibility/types';
import { buildQueryString } from '../lib/projects/dental-eligibility/similarity';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const force = process.argv.includes('--force');
  const casesPath = path.join(process.cwd(), 'data', 'dental-eligibility-cases.json');
  const cases: EligibilityCase[] = JSON.parse(fs.readFileSync(casesPath, 'utf-8'));

  if (force) {
    console.log('--force: clearing all existing embeddings');
    cases.forEach((c) => { c.embedding = []; });
  }

  // Always recompute query_string from the canonical buildQueryString function
  cases.forEach((c) => {
    c.query_string = buildQueryString(c.input);
  });

  const needsEmbedding = cases.filter((c) => c.embedding.length === 0);
  console.log(`Embedding ${needsEmbedding.length} of ${cases.length} cases (query_string computed for all)...`);

  for (const c of cases) {
    if (c.embedding.length > 0) {
      console.log(`  ✓ ${c.id} (already embedded)`);
      continue;
    }
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: c.query_string,
    });
    c.embedding = response.data[0].embedding;
    console.log(`  ✓ ${c.id} (${c.embedding.length} dims)`);
  }

  fs.writeFileSync(casesPath, JSON.stringify(cases, null, 2));
  console.log(`\nDone. Written to ${casesPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
