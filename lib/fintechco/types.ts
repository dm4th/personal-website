export type DemoKey = 'fred' | 'onboarding' | 'sre';

export type FintechcoTeam = 'Data Science' | 'Software Engineering' | 'SRE';

export interface DemoConfig {
  key: DemoKey;
  team: FintechcoTeam;
  title: string;
  blurb: string;
  href: string;
  /** Unlisted external embed (Loom / YouTube). Empty until recorded. */
  recordingUrl?: string;
  /** Static artifact under /presentations/fintechco when applicable. */
  artifactPath?: string;
  /** Flipped to true by the hub-wiring pass once the page exists. */
  live: boolean;
  /** Soft gate: label the card Coming Soon while keeping the link active. */
  comingSoon?: boolean;
  /** Short display date rendered verbatim on the card, e.g. "June 16" or "By June 15". */
  date?: string;
}

export interface HubCard {
  title: string;
  blurb: string;
  href: string;
  live: boolean;
  /** Soft gate: label the card Coming Soon while keeping the link active. */
  comingSoon?: boolean;
  /** Hard gate: render grayed-out and non-clickable with a "Closed" badge. */
  closed?: boolean;
  /** Short display date rendered verbatim on the card, e.g. "June 16" or "By June 15". */
  date?: string;
}

export type ResourceStatus = 'live' | 'coming-soon' | 'on-request';

export interface ResourceItem {
  title: string;
  note?: string;
  status: ResourceStatus;
  /** Rendered as a link only when status is 'live'. */
  href?: string;
}

export interface ResourceSection {
  heading: string;
  blurb?: string;
  items: ResourceItem[];
}

export interface PrimaryFocus {
  /** Which tile deserves attention right now; tracks the deal stage. */
  target: 'discovery' | 'deck' | DemoKey;
  /** Short chip text on the highlighted tile, e.g. "Start here". */
  label: string;
  /** One-line nudge rendered inside the highlighted tile. */
  note?: string;
}

export interface HubConfig {
  deck: HubCard;
  discovery: HubCard;
  demos: DemoConfig[];
  /** Exactly one highlighted tile; move this as the conversation advances. */
  primaryFocus?: PrimaryFocus;
  /** Deal-workspace sections below the tiles (legal, references, case studies). */
  resourceSections: ResourceSection[];
  /** Back-pocket demos, shown as on-request rows inside the demos section. */
  availableOnRequest: ResourceItem[];
}
