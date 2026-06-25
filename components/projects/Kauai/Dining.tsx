'use client';

import { RESTAURANTS, GF_LABELS, type Restaurant } from '@/lib/projects/kauai/dining';
import styles from './Dining.module.css';

// Render order + friendly headers, prioritizing where Maggie & Dan actually stay.
const REGION_ORDER: { key: Restaurant['region']; label: string }[] = [
  { key: 'east', label: '🌅 East Shore: Wailua & Kapaʻa' },
  { key: 'north', label: '🌴 North Shore: Kīlauea, Hanalei & Hāʻena' },
  { key: 'south', label: '🐢 South Shore: Poʻipū & Kōloa' },
  { key: 'lihue', label: '✈️ Lihuʻe: By the Airport' },
];

function GfBadge({ score }: { score: Restaurant['gfScore'] }) {
  return (
    <span className={`${styles.gfBadge} ${styles[`gf${score}`]}`}>
      {GF_LABELS[score]} · {score}/5
    </span>
  );
}

interface DiningProps {
  onFocusRestaurant: (id: string) => void;
  activeRestaurant: string | null;
}

export default function Dining({ onFocusRestaurant, activeRestaurant }: DiningProps) {
  return (
    <section className={styles.dining}>
      <h2 className={styles.title}>🍽️ Where to Eat (Gluten-Free First)</h2>
      <p className={styles.intro}>
        Maggie has celiac, so a gluten-free menu alone doesn&apos;t cut it. Every spot below is
        scored on how <strong>safe</strong> it actually is from cross-contamination, pulled from
        celiac reviews. Two rules at the table: tell them it&apos;s celiac, not a preference, and
        confirm the fryer before anything fried.
      </p>

      {/* GF score legend */}
      <div className={styles.scoreLegend}>
        <span className={`${styles.gfBadge} ${styles.gf5}`}>Celiac-safe · 5/5</span>
        <span className={`${styles.gfBadge} ${styles.gf4}`}>Great for GF · 4/5</span>
        <span className={`${styles.gfBadge} ${styles.gf3}`}>GF-friendly · 3/5</span>
        <span className={`${styles.gfBadge} ${styles.gf2}`}>Verify in person · 2/5</span>
      </div>

      {REGION_ORDER.map(({ key, label }) => {
        const places = RESTAURANTS.filter((r) => r.region === key).sort(
          (a, b) => b.gfScore - a.gfScore
        );
        if (places.length === 0) return null;
        return (
          <div key={key} className={styles.regionBlock}>
            <h3 className={styles.regionTitle}>{label}</h3>
            <div className={styles.grid}>
              {places.map((r) => {
                const active = activeRestaurant === r.id;
                return (
                  <div
                    key={r.id}
                    className={`${styles.card} ${active ? styles.cardActive : ''}`}
                  >
                    <div className={styles.cardHead}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.name}
                      >
                        {r.name} ↗
                      </a>
                      <GfBadge score={r.gfScore} />
                    </div>
                    <p className={styles.meta}>
                      {r.cuisine} · {r.area}
                    </p>
                    {r.tag && <p className={styles.tag}>⭐ {r.tag}</p>}
                    <p className={styles.why}>{r.why}</p>
                    {r.coords && (
                      <button
                        type="button"
                        className={`${styles.mapBtn} ${active ? styles.mapBtnActive : ''}`}
                        onClick={() => onFocusRestaurant(r.id)}
                      >
                        {active ? '✓ On map' : '📍 Show on map'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className={styles.disclaimer}>
        Scores are pulled from celiac-focused reviews (Find Me Gluten Free, Nom Nom Paleo,
        A Table Defloured, Spokin) as of June 2026. Menus and fryers change, so double-check in
        person.
      </p>
    </section>
  );
}
