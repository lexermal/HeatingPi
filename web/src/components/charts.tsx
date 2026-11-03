import { useId } from 'react';

// Dial covers 0..35 °C over a 270° sweep (from 135° to 405°, clockwise, 0° = 3 o'clock).
export const GAUGE_MIN = 0;
export const GAUGE_MAX = 35;
const START = 135;
const SWEEP = 270;
const clamp = (v: number) => Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, v));
const toAngle = (v: number) => START + ((clamp(v) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * SWEEP;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/** Thermostat-style dial: value arc, tick marks, and the running schema's range as an outer band. */
export function Gauge({ value, range, children }: { value: number | null; range?: { min: number; max: number }; children?: React.ReactNode }) {
  const id = useId().replace(/:/g, '');
  const cx = 100;
  const cy = 100;
  const r = 78;
  const circumference = (SWEEP / 360) * 2 * Math.PI * r;
  const fraction = value === null ? 0 : (clamp(value) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  const ticks = Array.from({ length: (GAUGE_MAX - GAUGE_MIN) / 5 + 1 }, (_, i) => GAUGE_MIN + i * 5);
  const needle = value === null ? START : toAngle(value);

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 200" role="img" aria-label={value === null ? 'No temperature' : `${value.toFixed(1)} degrees`}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--hp-cool)" />
            <stop offset="0.55" stopColor="var(--hp-amber)" />
            <stop offset="1" stopColor="var(--hp-ember)" />
          </linearGradient>
        </defs>
        <path d={arcPath(cx, cy, r, START, START + SWEEP)} fill="none" stroke="var(--hp-surface-2)" strokeWidth="14" strokeLinecap="round" />
        <path
          className="gauge-arc"
          d={arcPath(cx, cy, r, START, START + SWEEP)}
          fill="none"
          stroke={`url(#g-${id})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
        {range && (
          <path
            d={arcPath(cx, cy, r + 15, toAngle(range.min), Math.max(toAngle(range.min) + 0.5, toAngle(range.max)))}
            fill="none"
            stroke="var(--hp-ember)"
            strokeOpacity="0.45"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {ticks.map((t) => {
          const [x1, y1] = polar(cx, cy, r - 13, toAngle(t));
          const [x2, y2] = polar(cx, cy, r - 19, toAngle(t));
          const [lx, ly] = polar(cx, cy, r + 27, toAngle(t));
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--hp-muted)" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
              {t % 10 === 0 && (
                <text x={lx} y={ly} fill="var(--hp-muted)" fontSize="8" textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace">
                  {t}
                </text>
              )}
            </g>
          );
        })}
        {value !== null && (
          <g className="gauge-needle" style={{ transform: `rotate(${needle}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
            <circle cx={cx + r} cy={cy} r="7" fill="var(--hp-surface)" stroke="var(--hp-ember)" strokeWidth="3" />
          </g>
        )}
      </svg>
      <div className="gauge-center">{children}</div>
    </div>
  );
}

/** Area sparkline of the last 24 h. */
export function Sparkline({ points }: { points: { date: number; value: number }[] }) {
  const id = useId().replace(/:/g, '');
  if (points.length < 2) return <div className="text-body-secondary small py-4 text-center">Collecting data — the chart appears after a few readings.</div>;

  const w = 600;
  const h = 120;
  const pad = 6;
  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = Math.max(hi - lo, 1);
  const t0 = points[0].date;
  const t1 = points[points.length - 1].date;
  const x = (t: number) => pad + ((t - t0) / Math.max(t1 - t0, 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - lo) / span) * (h - pad * 2 - 14);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const fmt = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label="Temperature over the last 24 hours">
        <defs>
          <linearGradient id={`s-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--hp-ember)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--hp-ember)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${x(t1)},${h} L${x(t0)},${h} Z`} fill={`url(#s-${id})`} />
        <path d={line} fill="none" stroke="var(--hp-ember)" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="d-flex justify-content-between flex-wrap gap-1 small text-body-secondary mono mt-1">
        <span>{fmt(t0)}</span>
        <span className="spark-range">
          min {lo.toFixed(1)}° · max {hi.toFixed(1)}°
        </span>
        <span>{fmt(t1)}</span>
      </div>
    </div>
  );
}

/** Horizontal min–max bar on the gauge scale, with a marker for the current temperature. */
export function RangeBar({ min, max, now }: { min: number; max: number; now?: number | null }) {
  const pct = (v: number) => ((clamp(v) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
  const left = pct(min);
  const width = Math.max(pct(max) - left, 1.5);
  return (
    <div className="range-track" aria-hidden>
      <div className="range-fill" style={{ left: `${left}%`, width: `${width}%` }} />
      {now !== null && now !== undefined && <div className="range-now" style={{ left: `calc(${pct(now)}% - 1px)` }} />}
    </div>
  );
}
