import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  unit,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  tone?: "default" | "verified" | "anomaly";
  icon?: ReactNode;
}) {
  const toneRing =
    tone === "anomaly" ? "glow-anomaly" : tone === "verified" ? "glow-verified" : "";
  const toneText =
    tone === "anomaly"
      ? "text-anomaly"
      : tone === "verified"
        ? "text-verified"
        : "text-foreground";

  return (
    <div className={`panel-surface rounded-lg p-4 ${toneRing}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>
      <div className={`mt-3 flex items-baseline gap-1.5 text-mono ${toneText}`}>
        <span className="text-3xl font-bold leading-none">{value}</span>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}