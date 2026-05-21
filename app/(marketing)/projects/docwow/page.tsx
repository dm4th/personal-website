import type { Metadata } from 'next';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import DocWowDemo from './DocWowDemo';
import samplesData from '@/data/docwow-samples.json';
import type { SampleDoc } from '@/lib/projects/docwow/types';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'DocWow | Dan Mathieson',
  description: 'Chat with a medical PDF. AWS Textract extracts bounding boxes so every citation highlights the exact source region.',
};

export default function DocWowPage() {
  const allInfoData = getSortedInfo();
  const samples = samplesData as SampleDoc[];

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>DocWow</h1>
          <p className={styles.subtitle}>
            Upload a medical PDF, pick an analysis profile, and chat with it.
            The Anthropic SDK runs with a dynamically generated skill file — every answer cites the
            exact source location highlighted in the document.
          </p>
          <div className={styles.pills}>
            {['Anthropic SDK', 'AWS Textract OCR', 'Bounding Box Citations', 'Dynamic Skill Files'].map((t) => (
              <span key={t} className={styles.pill}>{t}</span>
            ))}
          </div>
        </div>
        <div className={styles.demo}>
          <DocWowDemo samples={samples} />
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
