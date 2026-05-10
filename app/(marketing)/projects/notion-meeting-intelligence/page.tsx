import type { Metadata } from 'next';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import NotionMeetingDemo from './NotionMeetingDemo';
import styles from './page.module.css';
import samplesData from '@/data/notion-meeting-samples.json';
import type { TranscriptSample } from '@/lib/projects/notion-meeting-intelligence/types';

export const metadata: Metadata = {
  title: 'AI-Native GTM Engine | Dan Mathieson',
  description:
    'Paste a sales transcript and watch six Claude agents analyze it in parallel - executive summary, sales coaching, commercial pricing, delivery risk, product feedback, and ICP fit. Results write directly to your Notion GTM Hub.',
};

export default function NotionMeetingPage() {
  const allInfoData = getSortedInfo();
  const samples = samplesData as TranscriptSample[];

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.page}>
        <NotionMeetingDemo samples={samples} />
      </div>
      <SiteFooter />
    </>
  );
}
