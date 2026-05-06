import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import type { EligibilityCase } from '../lib/projects/dental-eligibility/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildEmbeddingInput(c: EligibilityCase): string {
  return `${c.input.procedure_code} ${c.input.procedure_description} ${c.input.payer} ${c.input.coverage_text}`;
}

async function main() {
  const force = process.argv.includes('--force');
  const casesPath = path.join(process.cwd(), 'data', 'dental-eligibility-cases.json');
  const cases: EligibilityCase[] = JSON.parse(fs.readFileSync(casesPath, 'utf-8'));

  if (force) {
    console.log('--force: clearing all existing embeddings');
    cases.forEach((c) => { c.embedding = []; });
  }

  const needsEmbedding = cases.filter((c) => c.embedding.length === 0);
  console.log(`Embedding ${needsEmbedding.length} of ${cases.length} cases...`);

  for (const c of cases) {
    if (c.embedding.length > 0) {
      console.log(`  ✓ ${c.id} (already embedded)`);
      continue;
    }
    const input = buildEmbeddingInput(c);
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input,
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
