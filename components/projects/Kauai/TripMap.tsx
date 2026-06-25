'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TRIP } from '@/lib/projects/kauai/trip';
import { RESTAURANTS, GF_LABELS } from '@/lib/projects/kauai/dining';
import styles from './TripMap.module.css';

// The map can be focused on the whole trip, a single day, or a single
// restaurant (which keeps all four lodgings visible for distance context).
export type MapFilter =
  | { kind: 'all' }
  | { kind: 'day'; date: string }
  | { kind: 'restaurant'; id: string };

// Tropical color key, kept in sync with the legend in KauaiTrip.tsx.
const COLORS = {
  lodging: '#0e7490', // ocean teal
  scheduled: '#ea580c', // sunset coral
  flexible: '#15803d', // palm green
  dining: '#e84393', // plumeria pink
} as const;

/** Build a small colored map pin as a Leaflet DivIcon (no image assets needed). */
function dot(color: string, label?: string) {
  return L.divIcon({
    className: styles.pinWrap,
    html: label
      ? `<span class="${styles.lodgePin}" style="--pin:${color}"><b>${label}</b></span>`
      : `<span class="${styles.dotPin}" style="--pin:${color}"></span>`,
    iconSize: label ? [26, 26] : [16, 16],
    iconAnchor: label ? [13, 13] : [8, 8],
    popupAnchor: [0, label ? -14 : -8],
  });
}

function popupHtml(title: string, sub?: string, url?: string): string {
  const heading = url
    ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${styles.popLink}">${title} ↗</a>`
    : `<strong>${title}</strong>`;
  return `<div class="${styles.popup}">${heading}${sub ? `<p>${sub}</p>` : ''}</div>`;
}

export default function TripMap({ filter }: { filter: MapFilter }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true, // scroll-to-zoom, as requested
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Rebuild the markers whenever the filter changes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: [number, number][] = [];

    const day = filter.kind === 'day' ? TRIP.days.find((d) => d.date === filter.date) : null;
    const focusLodge = day?.lodgingId ? TRIP.lodging.find((l) => l.id === day.lodgingId) : null;
    const focusRegion = focusLodge?.region ?? null;

    // Lodging: all four, except a day view narrows to that night's base. A
    // restaurant view deliberately keeps all four so you can gauge distance.
    TRIP.lodging.forEach((lodge, i) => {
      if (filter.kind === 'day' && lodge.id !== day?.lodgingId) return;
      L.marker(lodge.coords, { icon: dot(COLORS.lodging, String(i + 1)), zIndexOffset: 1000 })
        .addTo(layer)
        .bindPopup(popupHtml(`${i + 1}. ${lodge.name}`, lodge.area, lodge.url));
      bounds.push(lodge.coords);
    });

    // Activities: everything on the full view; just this day's items on a day
    // view; none on a restaurant view.
    let activityIds: string[] = [];
    if (filter.kind === 'all') activityIds = Object.keys(TRIP.activities);
    else if (filter.kind === 'day' && day) activityIds = [...day.scheduled, ...day.flexible];
    activityIds.forEach((id) => {
      const act = TRIP.activities[id];
      if (!act?.coords) return;
      const color = act.kind === 'scheduled' ? COLORS.scheduled : COLORS.flexible;
      L.marker(act.coords, { icon: dot(color) })
        .addTo(layer)
        .bindPopup(popupHtml(act.title, act.blurb, act.url));
      bounds.push(act.coords);
    });

    // Dining: all on the full view; that region's spots on a day view; just the
    // one selected spot on a restaurant view (auto-opened so it's obvious).
    RESTAURANTS.forEach((r) => {
      if (!r.coords) return;
      if (filter.kind === 'day' && r.region !== focusRegion) return;
      if (filter.kind === 'restaurant' && r.id !== filter.id) return;
      const marker = L.marker(r.coords, { icon: dot(COLORS.dining), zIndexOffset: 1500 })
        .addTo(layer)
        .bindPopup(popupHtml(`🍽️ ${r.name}`, `${GF_LABELS[r.gfScore]} · ${r.cuisine}`, r.url));
      bounds.push(r.coords);
      if (filter.kind === 'restaurant') marker.openPopup();
    });

    if (bounds.length > 0) {
      const maxZoom = filter.kind === 'day' ? 13 : filter.kind === 'restaurant' ? 12 : 11;
      map.fitBounds(bounds, { padding: [45, 45], maxZoom });
    }
  }, [filter]);

  return <div ref={containerRef} className={styles.map} aria-label="Map of Kauai trip locations" />;
}
