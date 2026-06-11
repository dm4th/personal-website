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
}

export interface HubCard {
  title: string;
  blurb: string;
  href: string;
  live: boolean;
  /** Soft gate: label the card Coming Soon while keeping the link active. */
  comingSoon?: boolean;
}

export interface HubConfig {
  deck: HubCard;
  discovery: HubCard;
  demos: DemoConfig[];
  /** Back-pocket demos surfaced as text only, never links. */
  availableOnRequest: string[];
}
