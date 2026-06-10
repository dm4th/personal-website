import type { Metadata } from 'next';
import DiscoveryResults from '@/components/fintechco/DiscoveryResults';

export const metadata: Metadata = {
  title: 'Discovery Results | FinTechCo Workspace',
  description: 'Dan-only view of submitted discovery responses.',
  robots: { index: false, follow: false },
};

export default function DiscoveryResultsPage() {
  return <DiscoveryResults />;
}
