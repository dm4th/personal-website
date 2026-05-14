type Props = { score: number };

export default function FitScoreWheel({ score }: Props) {
  const radius = 40;
  const strokeWidth = 7;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  const color =
    score >= 75 ? 'var(--success)' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Score number */}
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="20"
        fontWeight="700"
        fontFamily="inherit"
      >
        {score}
      </text>
      {/* /100 label */}
      <text
        x={size / 2}
        y={size / 2 + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--muted)"
        fontSize="10"
        fontFamily="inherit"
      >
        /100
      </text>
    </svg>
  );
}
