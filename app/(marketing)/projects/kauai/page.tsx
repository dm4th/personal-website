import type { Metadata } from 'next';
import KauaiTrip from '@/components/projects/Kauai/KauaiTrip';

// Standalone, direct-link-only family page for Jeff's 60th birthday trip.
// Intentionally not registered in the projects listing or site nav.
export const metadata: Metadata = {
  title: "Jeff's 60th Birthday Adventure | Kauaʻi 2026",
  description:
    'Our family trip to Kauaʻi for Jeff’s 60th — lodging, the locked-in plans, flexible ideas, and a map of the whole island.',
  robots: { index: false, follow: false },
};

export default function KauaiTripPage() {
  return <KauaiTrip />;
}
