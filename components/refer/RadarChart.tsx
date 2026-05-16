'use client';

import type { JobFitDimensions } from '@/lib/content/jobApplications';

const AXES: Array<{
  key: keyof JobFitDimensions;
  label: string;
  line1: string;
  line2: string;
  anchor: 'middle' | 'start' | 'end';
}> = [
  { key: 'coreJobFunction',  label: 'Core Function',  line1: 'Core',     line2: 'Function', anchor: 'middle' },
  { key: 'seniority',        label: 'Seniority',       line1: 'Seniority', line2: '',         anchor: 'start'  },
  { key: 'technicalSkills',  label: 'Tech Skills',     line1: 'Tech',     line2: 'Skills',   anchor: 'start'  },
  { key: 'industryVertical', label: 'Industry Fit',    line1: 'Industry', line2: 'Fit',      anchor: 'end'    },
  { key: 'logistics',        label: 'Logistics',       line1: 'Logistics', line2: '',        anchor: 'end'    },
];

type Props = {
  dimensions: JobFitDimensions;
  size?: number;
  accentColor?: string;
};

const W = 340;
const H = 300;
const CX = 170;
const CY = 150;
const MAX_R = 88;
const LABEL_R = MAX_R + 26;
const N = AXES.length;

function angle(i: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / N;
}

function toXY(r: number, i: number): [number, number] {
  const a = angle(i);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function scorePath(dimensions: JobFitDimensions): string {
  const pts = AXES.map((ax, i) => {
    const r = MAX_R * (dimensions[ax.key].score / 10);
    return toXY(r, i);
  });
  return `M ${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L ')} Z`;
}

function gridPath(fraction: number): string {
  const pts = AXES.map((_, i) => toXY(MAX_R * fraction, i));
  return `M ${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L ')} Z`;
}

export default function RadarChart({ dimensions, accentColor = 'var(--accent)' }: Props) {
  const path = scorePath(dimensions);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: '100%' }}
      aria-label="Radar chart of fit score dimensions"
    >
      {/* Grid rings at 25%, 50%, 75%, 100% */}
      {[0.25, 0.5, 0.75, 1.0].map((f) => (
        <path
          key={f}
          d={gridPath(f)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={f === 1 ? 1 : 0.6}
          opacity={f === 1 ? 0.6 : 0.3}
        />
      ))}

      {/* Axis spokes */}
      {AXES.map((_, i) => {
        const [x2, y2] = toXY(MAX_R, i);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x2}
            y2={y2}
            stroke="var(--border)"
            strokeWidth={0.6}
            opacity={0.35}
          />
        );
      })}

      {/* Score polygon (animates via CSS on `d`) */}
      <path
        d={path}
        fill={accentColor}
        fillOpacity={0.14}
        stroke={accentColor}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: 'd 0.35s ease' }}
      />

      {/* Score dots */}
      {AXES.map((ax, i) => {
        const r = MAX_R * (dimensions[ax.key].score / 10);
        const [x, y] = toXY(r, i);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill={accentColor}
            style={{ transition: 'cx 0.35s ease, cy 0.35s ease' }}
          />
        );
      })}

      {/* Axis labels with scores */}
      {AXES.map((ax, i) => {
        const [lx, ly] = toXY(LABEL_R, i);
        const score = dimensions[ax.key].score;
        const hasTwoLines = !!ax.line2;
        return (
          <text
            key={i}
            textAnchor={ax.anchor}
            dominantBaseline="middle"
            fontSize={8.5}
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="var(--muted)"
          >
            {hasTwoLines ? (
              <>
                <tspan x={lx} y={ly - 8}>{ax.line1}</tspan>
                <tspan x={lx} y={ly + 1}>{ax.line2}</tspan>
                <tspan x={lx} y={ly + 12} fill={accentColor} fontWeight="700" fontSize={9}>
                  {score}/10
                </tspan>
              </>
            ) : (
              <>
                <tspan x={lx} y={ly - 4}>{ax.line1}</tspan>
                <tspan x={lx} y={ly + 8} fill={accentColor} fontWeight="700" fontSize={9}>
                  {score}/10
                </tspan>
              </>
            )}
          </text>
        );
      })}
    </svg>
  );
}
