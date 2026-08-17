import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EvaluatedEntry } from "@/lib/stp";

type Dot = { cx?: number; cy?: number; payload?: EvaluatedEntry; index?: number };

function PointMarker({ cx, cy, payload }: Dot) {
  if (cx == null || cy == null || !payload) return null;
  if (payload.anomaly) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={11} fill="var(--anomaly)" opacity={0.18} />
        <circle cx={cx} cy={cy} r={7} fill="var(--anomaly)" opacity={0.3} />
        <path
          d={`M ${cx - 5.5} ${cy - 5.5} L ${cx + 5.5} ${cy + 5.5} M ${cx + 5.5} ${cy - 5.5} L ${cx - 5.5} ${cy + 5.5}`}
          stroke="var(--anomaly)"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="var(--verified)"
      stroke="var(--panel)"
      strokeWidth={1.5}
    />
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: EvaluatedEntry }>;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="panel-surface rounded-md px-3 py-2 text-xs">
      <p className="text-mono text-muted-foreground">{row.timestamp}</p>
      <p className="mt-1.5 text-mono text-foreground">
        Reported: <span className="font-semibold">{row.mld.toFixed(1)} MLD</span>
      </p>
      <p className="text-mono text-foreground">
        Energy: <span className="font-semibold">{row.kwh.toLocaleString()} kWh</span>
      </p>
      <p className="text-mono text-foreground">
        Ratio: <span className="font-semibold">{row.ratio.toFixed(1)} kWh/MLD</span>
      </p>
      <p
        className={`mt-1.5 text-[11px] font-semibold uppercase tracking-widest ${row.anomaly ? "text-anomaly" : "text-verified"}`}
      >
        {row.anomaly ? "Anomaly flag" : "Pass"}
      </p>
    </div>
  );
}

export function EnergyChart({ data }: { data: EvaluatedEntry[] }) {
  const expected = data.map((d) => ({ ...d, baseline: d.mld * 170 }));

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={expected} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--grid-line)"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="var(--grid-line)"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--grid-line)" }} />
          <ReferenceLine y={0} stroke="var(--grid-line)" />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="var(--baseline)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            name="Expected draw"
          />
          <Line
            type="monotone"
            dataKey="kwh"
            stroke="var(--verified)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={<PointMarker />}
            activeDot={false}
            name="Measured kWh"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}