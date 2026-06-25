'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { TRIP } from '@/lib/projects/kauai/trip';
import type { Lodging } from '@/lib/projects/kauai/types';
import { formatLong, weekday, formatShort } from '@/lib/projects/kauai/dates';
import Dining from './Dining';
import type { MapFilter } from './TripMap';
import styles from './KauaiTrip.module.css';

// Leaflet touches `window`, so the map is client-only: skip SSR entirely.
const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading the island…</div>,
});

const lodgingById = (id: string | null): Lodging | undefined =>
  TRIP.lodging.find((l) => l.id === id);

export default function KauaiTrip() {
  // The map filter: the whole trip, a single day, or a single restaurant.
  const [filter, setFilter] = useState<MapFilter>({ kind: 'all' });
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const selectedDate = filter.kind === 'day' ? filter.date : null;
  const selectedRestaurant = filter.kind === 'restaurant' ? filter.id : null;

  // Apply a filter and bring the map into view so the change is visible.
  const applyFilter = (next: MapFilter) => {
    setFilter(next);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Toggle a day's "Show on map" button.
  const focusDay = (date: string) => {
    applyFilter(selectedDate === date ? { kind: 'all' } : { kind: 'day', date });
  };

  // Toggle a restaurant's "Show on map" button (keeps all lodging visible).
  const focusRestaurant = (id: string) => {
    applyFilter(selectedRestaurant === id ? { kind: 'all' } : { kind: 'restaurant', id });
  };

  return (
    <main className={styles.page}>
      {/* ---------- Hero ---------- */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>🌺 Aloha, Family 🌺</p>
          <h1 className={styles.title}>{TRIP.title}</h1>
          <p className={styles.subtitle}>{TRIP.subtitle}</p>
          <p className={styles.lede}>
            Colleen mapped out two weeks on Kauaʻi for Jeff&apos;s 60th. Here&apos;s where
            we&apos;re staying, what&apos;s already locked in, and a big pile of ideas for the open
            days. Chase waterfalls, find the honu, watch the sun go down. Happy birthday, Jeff. 🎂
          </p>
        </div>
        <div className={styles.heroWave} aria-hidden="true" />
      </header>

      <div className={styles.body}>
        {/* ---------- Legend ---------- */}
        <section className={styles.legend} aria-label="Color key">
          <span className={`${styles.legendItem} ${styles.lodging}`}>
            <span className={styles.swatch} /> Where We Stay
          </span>
          <span className={`${styles.legendItem} ${styles.scheduled}`}>
            <span className={styles.swatch} /> Locked In
          </span>
          <span className={`${styles.legendItem} ${styles.flexible}`}>
            <span className={styles.swatch} /> Flexible Ideas
          </span>
          <span className={`${styles.legendItem} ${styles.diningLegend}`}>
            <span className={styles.swatch} /> Eats (GF-Friendly)
          </span>
        </section>

        {/* ---------- Map ---------- */}
        <section className={styles.section} ref={mapSectionRef}>
          <h2 className={styles.sectionTitle}>🗺️ The Island, Pinned</h2>
          <p className={styles.sectionSub}>
            Numbered pins are our four home-bases, in order around the island. Dots are activities
            and food. Tap any pin for details and a link. Pick a day to filter the map to what&apos;s
            nearby.
          </p>

          <div className={styles.mapControls}>
            <label htmlFor="day-filter" className={styles.controlLabel}>
              Show:
            </label>
            <select
              id="day-filter"
              className={styles.daySelect}
              value={selectedDate ?? ''}
              onChange={(e) =>
                setFilter(e.target.value ? { kind: 'day', date: e.target.value } : { kind: 'all' })
              }
            >
              <option value="">The whole trip</option>
              {TRIP.days.map((d) => (
                <option key={d.date} value={d.date}>
                  {weekday(d.date)}, {formatLong(d.date).replace(/^\w+,\s/, '')}
                </option>
              ))}
            </select>
            {filter.kind !== 'all' && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setFilter({ kind: 'all' })}
              >
                Reset
              </button>
            )}
          </div>

          <TripMap filter={filter} />
        </section>

        {/* ---------- Where we stay ---------- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏠 Where We&apos;re Staying</h2>
          <div className={styles.lodgeGrid}>
            {TRIP.lodging.map((lodge, i) => (
              <a
                key={lodge.id}
                href={lodge.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.lodgeCard} ${styles[`region_${lodge.region}`]}`}
              >
                <span className={styles.lodgeNum}>{i + 1}</span>
                <div className={styles.lodgeBody}>
                  <h3 className={styles.lodgeName}>{lodge.name}</h3>
                  <p className={styles.lodgeArea}>{lodge.area}</p>
                  <p className={styles.lodgeDates}>
                    {formatShort(lodge.checkIn)} to {formatShort(lodge.checkOut)}
                  </p>
                  {lodge.note && <p className={styles.lodgeNote}>{lodge.note}</p>}
                </div>
                <span className={styles.lodgeArrow}>↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* ---------- Day-by-day feed ---------- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📅 Day by Day</h2>
          <p className={styles.sectionSub}>
            The full family runs June 30 to July 13. Tap “Show on map” on any day to see just
            what&apos;s near that night&apos;s home-base.
          </p>
          <ol className={styles.feed}>
            {TRIP.days.map((day) => {
              const lodge = lodgingById(day.lodgingId);
              const active = selectedDate === day.date;
              return (
                <li
                  key={day.date}
                  className={`${styles.feedItem} ${active ? styles.feedItemActive : ''}`}
                >
                  <div className={styles.feedRail}>
                    <span className={styles.railWeekday}>{weekday(day.date)}</span>
                    <span className={styles.railDay}>{formatShort(day.date).replace(/^\w+\s/, '')}</span>
                    <span className={styles.railMonth}>{formatShort(day.date).replace(/\s\d+$/, '')}</span>
                  </div>

                  <div className={styles.feedBody}>
                    <div className={styles.feedHead}>
                      <span className={styles.feedDate}>{formatLong(day.date)}</span>
                      <button
                        type="button"
                        className={`${styles.mapBtn} ${active ? styles.mapBtnActive : ''}`}
                        onClick={() => focusDay(day.date)}
                      >
                        {active ? '✓ On map' : '📍 Show on map'}
                      </button>
                    </div>

                    {day.milestone && <p className={styles.milestone}>{day.milestone}</p>}

                    {lodge && (
                      <p className={styles.feedLodge}>
                        <span className={styles.dotLodging} /> Sleep:{' '}
                        <a href={lodge.url} target="_blank" rel="noopener noreferrer">
                          {lodge.name}
                        </a>
                      </p>
                    )}

                    {day.scheduled.map((id) => {
                      const act = TRIP.activities[id];
                      return (
                        <div key={id} className={styles.scheduledRow}>
                          <span className={styles.dotScheduled} />
                          <div>
                            <a
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.scheduledTitle}
                            >
                              {act.title}
                            </a>
                            {act.time && <span className={styles.time}>{act.time}</span>}
                            {act.blurb && <p className={styles.scheduledBlurb}>{act.blurb}</p>}
                          </div>
                        </div>
                      );
                    })}

                    {day.flexible.length > 0 && (
                      <div className={styles.flexWrap}>
                        {day.flexible.map((id) => {
                          const act = TRIP.activities[id];
                          const chip = (
                            <>
                              <span className={styles.dotFlexible} /> {act.title}
                            </>
                          );
                          return act.url ? (
                            <a
                              key={id}
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.flexChip}
                              title={act.blurb}
                            >
                              {chip}
                            </a>
                          ) : (
                            <span key={id} className={styles.flexChip} title={act.blurb}>
                              {chip}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------- Dining (gluten-free first) ---------- */}
        <Dining onFocusRestaurant={focusRestaurant} activeRestaurant={selectedRestaurant} />

        {/* ---------- Photos ---------- */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📸 Memories</h2>
          <p className={styles.sectionSub}>
            We&apos;ll fill this in as the trip happens. Drop your favorites here.
          </p>
          <div className={styles.photoGrid}>
            {['Sunrise', 'Honu 🐢', 'Nā Pali', 'Waterfalls', 'The Crew', 'Birthday Boy 🎂'].map(
              (label) => (
                <div key={label} className={styles.photoSlot}>
                  <span>{label}</span>
                </div>
              )
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <p>Made with aloha for Jeff&apos;s 60th 🤙</p>
        </footer>
      </div>
    </main>
  );
}
