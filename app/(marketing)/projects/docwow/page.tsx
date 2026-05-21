import type { Metadata } from 'next';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import DocWowDemo from './DocWowDemo';
import samplesData from '@/data/docwow-samples.json';
import randomSamplesData from '@/data/docwow-random-samples.json';
import type { SampleDoc } from '@/lib/projects/docwow/types';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'DocWow | Dan Mathieson',
  description: 'Upload any PDF, pick an analysis profile, and chat with it. AWS Textract extracts bounding boxes so every citation highlights the exact source region.',
};

export default function DocWowPage() {
  const allInfoData = getSortedInfo();
  const samples = samplesData as SampleDoc[];
  const randomSamples = randomSamplesData as SampleDoc[];

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>DocWow</h1>
          <p className={styles.subtitle}>
            Upload any PDF, pick an analysis profile, and chat with it.
            The Anthropic SDK runs with a dynamically generated skill file: every answer cites the
            exact source location highlighted in the document. Built for medical records, but works
            on contracts, research papers, or anything else.
          </p>
          <div className={styles.pills}>
            {['Anthropic SDK', 'AWS Textract OCR', 'Bounding Box Citations', 'Dynamic Skill Files', 'AWS Lambda', 'DynamoDB Sessions', 'S3 Presigned Uploads', 'Forced Tool Use'].map((t) => (
              <span key={t} className={styles.pill}>{t}</span>
            ))}
          </div>
        </div>
        <div className={styles.demo}>
          <DocWowDemo samples={samples} randomSamples={randomSamples} />
        </div>
        <p className={styles.attribution}>
          Sample documents are AI-generated synthetic medical records created for demonstration purposes only.
          They contain no real patient, provider, or institutional data.
          Generated with Claude (Anthropic API) &middot; Randomizer pool includes discharge summaries, lab panels, radiology reports, operative notes, and prior authorization forms.
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
