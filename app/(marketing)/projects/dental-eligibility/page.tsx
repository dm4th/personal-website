import type { Metadata } from 'next';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import DentalEligibilityDemo from './DentalEligibilityDemo';
import styles from './page.module.css';
import casesData from '@/data/dental-eligibility-cases.json';
import type { EligibilityCase } from '@/lib/projects/dental-eligibility/types';

export const metadata: Metadata = {
  title: 'Dental Eligibility Intelligence | Dan Mathieson',
  description:
    'Live demo of the hybrid-RAG dental eligibility verification engine built at Thoughtful AI. 95%+ accuracy on a live dental billing workflow.',
};

export default function DentalEligibilityPage() {
  const allInfoData = getSortedInfo();
  const baseCases = (casesData as EligibilityCase[]).map(({ embedding: _e, ...rest }) => rest);

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.page}>
        <DentalEligibilityDemo baseCases={baseCases} />
      </div>
      <SiteFooter />
    </>
  );
}
