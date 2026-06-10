import type { HubConfig } from './types';

/**
 * Single source of truth for the FinTechCo workspace surface.
 * Later passes only edit data here (hrefs, live flags, recording URLs);
 * layout and components read this and should not hardcode card content.
 */
export const HUB_CONFIG: HubConfig = {
  deck: {
    title: 'Claude Code for FinTechCo',
    blurb:
      'The main walkthrough: a security-first look at rolling out one agentic coding tool across all three engineering teams.',
    href: '/fintechco/deck',
    live: false,
  },
  discovery: {
    title: 'Pre-Meeting Discovery',
    blurb:
      'A short, role-aware conversation. Pick your seat at the table and answer a few questions so the session is built around your priorities.',
    href: '/fintechco/discovery',
    live: true,
  },
  demos: [
    {
      key: 'fred',
      team: 'Data Science',
      title: 'Fed Policy to Portfolio Signal',
      blurb:
        'Your data science team has a unique insight about Fed policy and portfolio signals. Let\'s have Claude Code build a prototype in minutes within your secure environment to test the hypothesis.',
      href: '/fintechco/demos/fred-dashboard',
      recordingUrl: undefined,
      artifactPath: '/presentations/fintechco/fred-dashboard.html',
      live: true,
    },
    {
      key: 'onboarding',
      team: 'Software Engineering',
      title: 'Day-Three Onboarding',
      blurb:
        'Onboard a new member of the SWE team with a guided, secure, and efficient first contribution. Claude Code becomes the trusted foundation for future contributions.',
      href: '/fintechco/demos/onboarding-accelerator',
      recordingUrl: undefined,
      live: true,
    },
    {
      key: 'sre',
      team: 'SRE',
      title: 'Incident Triage to Runbook',
      blurb:
        'A critical service is experiencing latency spikes after a deploy. Use Claude Code to trace root cause, ship the fix, and update the runbook to prevent future incidents.',
      href: '/fintechco/demos/sre-triage',
      recordingUrl: undefined,
      live: true,
    },
  ],
  availableOnRequest: [
    'Governance and guardrails: the same repo before and after enterprise controls',
    'Legacy modernization: a contained, test-protected slice of a crusty service',
  ],
};
