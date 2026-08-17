import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LIMITS, type EvaluatedEntry } from "@/lib/stp";

type Dot = { cx?: number; cy?: number; payload?: EvaluatedEntry };

function marker(key: "turbidity" | "bod", limit: number, color: string) {
  return function Marker({ cx, cy, payload }: Dot) {
    if (cx == null || cy == null || !payload) return null;
    const over = payload[key] > limit;
    if (!over) {
      return <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="var(--panel)" strokeWidth={1.5} />;
    }
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="var(--anomaly)" opacity={0.2} />
        <circle cx={cx} cy={cy} r={5} fill="var(--anomaly)" stroke="var(--panel)" strokeWidth={1.5} />
      </g>
    );
  };
}

const TurbidityDot = marker("turbidity", LIMITS.turbidity, "var(--baseline)");
const BodDot = marker("bod", LIMITS.bod, "var(--verified)");

function QualityTooltip({
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
      <p className="mt-1.5 text-mono">
        Turbidity:{" "}
        <span
          className={`font-semibold ${row.turbidity > LIMITS.turbidity ? "text-anomaly" : "text-verified"}`}
        >
          {row.turbidity.toFixed(1)} NTU
        </span>
      </p>
      <p className="text-mono">
        BOD:{" "}
        <span
          className={`font-semibold ${row.bod > LIMITS.bod ? "text-anomaly" : "text-verified"}`}
        >
          {row.bod.toFixed(1)} mg/L
        </span>
      </p>
      <p className="text-mono">
        pH: <span className="font-semibold">{row.ph.toFixed(2)}</span> · COD:{" "}
        <span className="font-semibold">{row.cod.toFixed(0)} mg/L</span>
      </p>
      {row.dumping ? (
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-anomaly">
          CPCB limit exceeded
        </p>
      ) : null}
    </div>
  );
}

export function QualityChart({ data }: { data: EvaluatedEntry[] }) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
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
          <Tooltip content={<QualityTooltip />} cursor={{ stroke: "var(--grid-line)" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
            iconType="plainline"
          />
          <ReferenceLine
            y={LIMITS.turbidity}
            stroke="var(--anomaly)"
            strokeDasharray="6 4"
            label={{
              value: `CPCB limit ${LIMITS.turbidity} NTU / mg-L`,
              position: "insideTopRight",
              fill: "var(--anomaly)",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="turbidity"
            name="Turbidity (NTU)"
            stroke="var(--baseline)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={<TurbidityDot />}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="bod"
            name="BOD (mg/L)"
            stroke="var(--verified)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={<BodDot />}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
