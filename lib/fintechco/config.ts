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
    date: 'June 16',
  },
  discovery: {
    title: 'Pre-Meeting Discovery',
    blurb:
      'A short, role-aware conversation. Pick your seat at the table and answer a few questions so the session is built around your priorities.',
    href: '/fintechco/discovery',
    live: true,
    date: 'By June 15',
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
      comingSoon: true,
      date: 'June 16',
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
      comingSoon: true,
      date: 'June 16',
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
      comingSoon: true,
      date: 'June 16',
    },
  ],
  // Move this pointer as the conversation advances: discovery before the
  // session, 'deck' the week of the meeting, a demo key during the pilot.
  primaryFocus: {
    target: 'discovery',
    label: 'Start here',
    note: 'Ten minutes here before we meet shapes the whole session around your priorities.',
  },
  resourceSections: [
    {
      heading: 'Contracting & Legal',
      blurb: 'Everything your security and procurement teams will ask for, in one place.',
      items: [
        {
          title: 'Anthropic Trust Center',
          note: 'Security documentation, compliance certifications, and the subprocessor list.',
          status: 'live',
          href: 'https://trust.anthropic.com',
        },
        {
          title: 'SOC 2 Type II Report',
          note: 'Shared under NDA through the Trust Center.',
          status: 'on-request',
        },
        {
          title: 'Security Architecture Session with the Anthropic Team',
          note: 'A working session for your security leads, scheduled when you are ready.',
          status: 'on-request',
        },
        {
          title: 'Enterprise Order Form & Data Processing Addendum',
          note: 'Drafted once we scope the pilot together.',
          status: 'coming-soon',
        },
      ],
    },
    {
      heading: 'Referenceable Communications',
      blurb: 'Conversations with people who have walked this road before you.',
      items: [
        {
          title: 'Reference Call: Payments-Platform Engineering Leader',
          note: 'A peer who rolled Claude Code out across a regulated engineering org.',
          status: 'on-request',
        },
        {
          title: 'Reference Call: Head of Platform Security at a Digital Bank',
          note: 'The security-side perspective on evaluating and approving agentic tooling.',
          status: 'on-request',
        },
      ],
    },
    {
      heading: 'Requested Case Studies',
      blurb: 'Written stories from teams that look like yours, added as you ask for them.',
      items: [
        {
          title: 'Stripe',
          note: 'How Stripe ships with Claude across its engineering org.',
          status: 'live',
          href: 'https://claude.com/customers/stripe',
        },
        {
          title: 'PwC',
          note: 'Quality assurance and delivery work, accelerated with Claude.',
          status: 'live',
          href: 'https://claude.com/customers/pwc-qa',
        },
        {
          title: 'AIG',
          note: 'AI in a regulated insurance underwriting environment.',
          status: 'on-request',
        },
        {
          title: "Moody's",
          note: 'Financial research and analysis workflows.',
          status: 'on-request',
        },
        {
          title: 'CRED',
          note: 'A fintech engineering team building with Claude.',
          status: 'on-request',
        },
        {
          title: 'Rocket Mortgage',
          note: 'AI-assisted lending and homeownership workflows.',
          status: 'on-request',
        },
      ],
    },
  ],
  availableOnRequest: [
    {
      title: 'Governance & Guardrails',
      note: 'The same repo before and after enterprise controls.',
      status: 'on-request',
    },
    {
      title: 'Legacy Modernization',
      note: 'A contained, test-protected slice of a crusty legacy service.',
      status: 'on-request',
    },
  ],
};
