import type { EvaluatedEntry } from "@/lib/stp";

export function LogTable({ rows }: { rows: EvaluatedEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
            <th className="px-4 py-3 text-right font-medium">Reported MLD</th>
            <th className="px-4 py-3 text-right font-medium">Energy kWh</th>
            <th className="px-4 py-3 text-right font-medium">kWh / MLD</th>
            <th className="px-4 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-border transition-colors ${
                row.anomaly ? "bg-anomaly/10 hover:bg-anomaly/15" : "hover:bg-accent/40"
              }`}
            >
              <td className="px-4 py-3 text-mono text-muted-foreground">{row.timestamp}</td>
              <td className="px-4 py-3 text-right text-mono">{row.mld.toFixed(1)}</td>
              <td className="px-4 py-3 text-right text-mono">{row.kwh.toLocaleString()}</td>
              <td
                className={`px-4 py-3 text-right text-mono font-semibold ${row.anomaly ? "text-anomaly" : "text-verified"}`}
              >
                {row.ratio.toFixed(1)}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${
                    row.anomaly
                      ? "bg-anomaly/15 text-anomaly"
                      : "bg-verified/15 text-verified"
                  }`}
                >
                  {row.anomaly ? "Anomaly flag" : "Pass"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}