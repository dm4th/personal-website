import type { Metadata } from 'next';
import DiscoveryConversation from '@/components/fintechco/DiscoveryConversation';

export const metadata: Metadata = {
  title: 'Pre-Meeting Discovery | FinTechCo Workspace',
  description: 'A short, role-aware conversation to shape the session around your priorities.',
  robots: { index: false, follow: false },
};

export default function DiscoveryPage() {
  return <DiscoveryConversation />;
}
