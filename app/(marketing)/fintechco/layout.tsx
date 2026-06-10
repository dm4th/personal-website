import type { Metadata } from 'next';
import AccessGate from '@/components/fintechco/AccessGate';
import { FINTECHCO_THEME as T } from '@/lib/fintechco/theme';

export const metadata: Metadata = {
  title: 'FinTechCo · Anthropic | Claude Code Discovery & Solutions',
  description: 'A prospect portal prepared by Dan Mathieson, Solutions Architect.',
  robots: { index: false, follow: false },
};

/**
 * Gates the entire /fintechco subtree with a single unlock and scopes the
 * warm workspace palette via CSS variables that child module styles consume.
 */
export default function FintechcoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.cream,
        color: T.text,
        ['--ftc-terracotta' as string]: T.terracotta,
        ['--ftc-terracotta-bg' as string]: T.terracottaBg,
        ['--ftc-cream' as string]: T.cream,
        ['--ftc-card' as string]: T.card,
        ['--ftc-card-border' as string]: T.cardBorder,
        ['--ftc-text' as string]: T.text,
        ['--ftc-text-muted' as string]: T.textMuted,
      }}
    >
      <AccessGate />
      {children}
    </div>
  );
}
