import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, Droplets, Gauge, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/stp/MetricCard";
import { EnergyChart } from "@/components/stp/EnergyChart";
import { LogTable } from "@/components/stp/LogTable";
import {
  ANOMALY_THRESHOLD,
  evaluate,
  formatClock,
  formatStamp,
  seedLogs,
  type LogEntry,
} from "@/lib/stp";

const title = "STP-Tracker | Nag River Sewage Treatment Verifier";
const description =
  "Real-time anomaly detection matching smart-meter energy draw against reported NMC water purification logs.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>(() => seedLogs());
  const [mld, setMld] = useState("12.0");
  const [kwh, setKwh] = useState("800");

  const rows = useMemo(() => logs.map(evaluate), [logs]);
  const latest = rows[rows.length - 1];
  const anomalyCount = rows.filter((r) => r.anomaly).length;

  function addEntry(nextMld: number, nextKwh: number) {
    if (!Number.isFinite(nextMld) || !Number.isFinite(nextKwh) || nextMld <= 0) return;
    const now = new Date();
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${now.getTime()}-${prev.length}`,
        timestamp: formatStamp(now),
        label: formatClock(now),
        mld: nextMld,
        kwh: nextKwh,
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-panel/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 py-5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            💧 STP-Tracker <span className="text-muted-foreground">|</span> Nag River
            Sewage Treatment Verifier
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time anomaly detection matching energy draw against reported NMC
            purification logs.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-5 px-6 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="panel-surface h-fit rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="size-4 text-primary" /> Simulation Controls
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Inject a synthetic meter reading to test the verifier live.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntry(parseFloat(mld), parseFloat(kwh));
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="mld" className="text-xs text-muted-foreground">
                Reported Water Output (MLD)
              </Label>
              <Input
                id="mld"
                type="number"
                step="0.1"
                min="0"
                value={mld}
                onChange={(e) => setMld(e.target.value)}
                className="text-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kwh" className="text-xs text-muted-foreground">
                Measured Energy Draw (kWh)
              </Label>
              <Input
                id="kwh"
                type="number"
                step="1"
                min="0"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                className="text-mono"
              />
            </div>
            <Button type="submit" className="w-full">
              Inject Log Entry
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Quick presets
            </p>
            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-verified hover:text-verified"
                onClick={() => addEntry(10, 1900)}
              >
                <ShieldCheck className="size-4" /> Simulate Normal Operation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-anomaly hover:text-anomaly"
                onClick={() => addEntry(15, 400)}
              >
                <ShieldAlert className="size-4" /> Simulate Falsification Fraud
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground">
            Detection rule: an entry is flagged when the specific power efficiency drops
            below{" "}
            <span className="text-mono font-semibold text-foreground">
              {ANOMALY_THRESHOLD} kWh/MLD
            </span>
            .
          </div>
        </aside>

        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Latest Water Output"
              value={latest.mld.toFixed(1)}
              unit="MLD"
              hint={latest.timestamp}
              icon={<Droplets className="size-4" />}
            />
            <MetricCard
              label="Latest Energy Consumed"
              value={latest.kwh.toLocaleString()}
              unit="kWh"
              hint="Smart meter draw"
              icon={<Zap className="size-4" />}
            />
            <MetricCard
              label="Specific Power Efficiency"
              value={latest.ratio.toFixed(1)}
              unit="kWh / MLD"
              hint={`Threshold ${ANOMALY_THRESHOLD}`}
              tone={latest.anomaly ? "anomaly" : "verified"}
              icon={<Gauge className="size-4" />}
            />
            <MetricCard
              label="System Status"
              value={
                <span className="text-base font-bold">
                  {latest.anomaly ? "⚠️ FALSIFICATION DETECTED" : "✅ VERIFIED OPERATIONAL"}
                </span>
              }
              hint={`${anomalyCount} flagged of ${rows.length} logs`}
              tone={latest.anomaly ? "anomaly" : "verified"}
              icon={
                latest.anomaly ? (
                  <ShieldAlert className="size-4" />
                ) : (
                  <ShieldCheck className="size-4" />
                )
              }
            />
          </div>

          <div className="panel-surface rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Energy Consumption vs Time
                </h2>
                <p className="text-xs text-muted-foreground">
                  Measured draw against the expected treatment baseline.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-baseline" /> Baseline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-verified" /> Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-anomaly">✕</span> Anomaly
                </span>
              </div>
            </div>
            <div className="mt-4">
              <EnergyChart data={rows} />
            </div>
          </div>

          <div className="panel-surface rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground">Verification Log</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Full audit trail of submitted NMC purification records.
            </p>
            <LogTable rows={[...rows].reverse()} />
          </div>
        </section>
      </main>
    </div>
  );
}
