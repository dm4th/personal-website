/**
 * Warm palette shared with the static decks under /public/presentations.
 * The FinTechCo surface intentionally diverges from the dark site theme;
 * components style against these values (via the CSS variables set in
 * the route group's wrapper class) rather than app/globals.css tokens.
 */
export const FINTECHCO_THEME = {
  terracotta: '#C86A48',
  terracottaBg: 'rgba(200, 106, 72, 0.08)',
  cream: '#F5EEE4',
  card: '#EAE4D9',
  cardBorder: '#D8D2C7',
  text: '#1A1A1A',
  textMuted: '#4A4440',
  stageBg: '#111110',
} as const;

export type FintechcoTheme = typeof FINTECHCO_THEME;
