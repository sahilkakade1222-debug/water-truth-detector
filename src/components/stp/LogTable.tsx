import { LIMITS, type EvaluatedEntry } from "@/lib/stp";

const STATUS_STYLES = {
  pass: {
    row: "hover:bg-accent/40",
    badge: "bg-verified/15 text-verified",
    label: "Passed all checks",
  },
  warning: {
    row: "bg-warning/10 hover:bg-warning/15",
    badge: "bg-warning/15 text-warning",
    label: "Quality warning",
  },
  critical: {
    row: "bg-anomaly/12 hover:bg-anomaly/20",
    badge: "bg-anomaly/20 text-anomaly",
    label: "Critical violation",
  },
} as const;

function Cell({ value, breach, digits = 1 }: { value: number; breach: boolean; digits?: number }) {
  return (
    <td
      className={`px-4 py-3 text-right text-mono ${breach ? "font-semibold text-anomaly" : "text-foreground"}`}
    >
      {value.toFixed(digits)}
    </td>
  );
}

export function LogTable({ rows }: { rows: EvaluatedEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[940px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
            <th className="px-4 py-3 text-right font-medium">MLD</th>
            <th className="px-4 py-3 text-right font-medium">kWh</th>
            <th className="px-4 py-3 text-right font-medium">kWh / MLD</th>
            <th className="px-4 py-3 text-right font-medium">pH</th>
            <th className="px-4 py-3 text-right font-medium">NTU</th>
            <th className="px-4 py-3 text-right font-medium">BOD</th>
            <th className="px-4 py-3 text-right font-medium">COD</th>
            <th className="px-4 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const s = STATUS_STYLES[row.status];
            return (
              <tr key={row.id} className={`border-t border-border transition-colors ${s.row}`}>
                <td className="px-4 py-3 text-mono text-muted-foreground">{row.timestamp}</td>
                <td className="px-4 py-3 text-right text-mono">{row.mld.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-mono">{row.kwh.toLocaleString()}</td>
                <Cell value={row.ratio} breach={row.falsification} />
                <td
                  className={`px-4 py-3 text-right text-mono ${row.phBreach ? "font-semibold text-warning" : ""}`}
                >
                  {row.ph.toFixed(2)}
                </td>
                <Cell value={row.turbidity} breach={row.turbidity > LIMITS.turbidity} />
                <Cell value={row.bod} breach={row.bod > LIMITS.bod} />
                <td
                  className={`px-4 py-3 text-right text-mono ${row.codBreach ? "font-semibold text-warning" : ""}`}
                >
                  {row.cod.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${s.badge}`}
                    title={row.reasons.join(", ")}
                  >
                    {s.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
