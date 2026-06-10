import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { HUB_CONFIG } from '@/lib/fintechco/config';
import SreTriageArtifact from '@/components/fintechco/SreTriageArtifact';

export const metadata: Metadata = {
  title: 'SRE Triage | FinTechCo Workspace',
  robots: { index: false, follow: false },
};

function readArtifact(filename: string): string {
  return readFileSync(join(process.cwd(), 'data/fintechco', filename), 'utf-8');
}

export default function SreTriagePage() {
  const sreConfig = HUB_CONFIG.demos.find((d) => d.key === 'sre');
  const recordingUrl = sreConfig?.recordingUrl;

  const rootCause = readArtifact('sre-root-cause.md');
  const fixDiff = readArtifact('sre-fix.diff');
  const runbookBefore = readArtifact('sre-runbook-before.md');
  const runbookAfter = readArtifact('sre-runbook-after.md');
  const mttrNarrative = readArtifact('sre-mttr.md');

  return (
    <SreTriageArtifact
      recordingUrl={recordingUrl}
      rootCause={rootCause}
      fixDiff={fixDiff}
      runbookBefore={runbookBefore}
      runbookAfter={runbookAfter}
      mttrNarrative={mttrNarrative}
    />
  );
}
