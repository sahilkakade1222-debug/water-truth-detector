import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Beaker,
  Droplets,
  FlaskConical,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/stp/MetricCard";
import { EnergyChart } from "@/components/stp/EnergyChart";
import { QualityChart } from "@/components/stp/QualityChart";
import { LogTable } from "@/components/stp/LogTable";
import {
  ANOMALY_THRESHOLD,
  LIMITS,
  evaluate,
  formatClock,
  formatStamp,
  seedLogs,
  type LogEntry,
} from "@/lib/stp";

const title = "STP-Tracker | Nag River Sewage Treatment Verifier";
const description =
  "Energy-to-output falsification checks plus live CPCB water quality compliance monitoring for Nag River sewage treatment records.";

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
  const [ph, setPh] = useState(7.2);
  const [turbidity, setTurbidity] = useState(5);
  const [bod, setBod] = useState(6);
  const [cod, setCod] = useState("32");

  const rows = useMemo(() => logs.map(evaluate), [logs]);
  const latest = rows[rows.length - 1] ?? evaluate(seedLogs()[0]!);
  const criticalCount = rows.filter((r) => r.status === "critical").length;

  function addEntry(next: Partial<LogEntry> & { mld: number; kwh: number }) {
    if (!Number.isFinite(next.mld) || !Number.isFinite(next.kwh) || next.mld <= 0) return;
    const now = new Date();
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${now.getTime()}-${prev.length}`,
        timestamp: formatStamp(now),
        label: formatClock(now),
        ph,
        turbidity,
        bod,
        cod: parseFloat(cod) || 0,
        ...next,
      },
    ]);
  }

  function contaminationEvent() {
    setTurbidity(35);
    setBod(45);
    setCod("110");
    addEntry({ mld: 13, kwh: 2300, ph: 8.9, turbidity: 35, bod: 45, cod: 110 });
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
            Multi-factor auditing: energy-to-output falsification plus CPCB discharge
            quality compliance.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-5 px-6 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="panel-surface h-fit rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="size-4 text-primary" /> Simulation Controls
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Inject a synthetic meter + lab reading to test the verifier live.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntry({ mld: parseFloat(mld), kwh: parseFloat(kwh) });
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

            <div className="space-y-4 border-t border-border pt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Water quality injection
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-muted-foreground">pH Level</Label>
                  <span className="text-mono text-foreground">{ph.toFixed(1)}</span>
                </div>
                <Slider
                  value={[ph]}
                  min={0}
                  max={14}
                  step={0.1}
                  onValueChange={(v) => setPh(v[0]!)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-muted-foreground">Turbidity (NTU)</Label>
                  <span className="text-mono text-foreground">{turbidity.toFixed(1)}</span>
                </div>
                <Slider
                  value={[turbidity]}
                  min={0}
                  max={50}
                  step={0.5}
                  onValueChange={(v) => setTurbidity(v[0]!)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-muted-foreground">BOD (mg/L)</Label>
                  <span className="text-mono text-foreground">{bod.toFixed(1)}</span>
                </div>
                <Slider
                  value={[bod]}
                  min={0}
                  max={100}
                  step={0.5}
                  onValueChange={(v) => setBod(v[0]!)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cod" className="text-xs text-muted-foreground">
                  COD (mg/L)
                </Label>
                <Input
                  id="cod"
                  type="number"
                  step="1"
                  min="0"
                  value={cod}
                  onChange={(e) => setCod(e.target.value)}
                  className="text-mono"
                />
              </div>
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
                onClick={() =>
                  addEntry({ mld: 10, kwh: 1900, ph: 7.2, turbidity: 4, bod: 5.5, cod: 28 })
                }
              >
                <ShieldCheck className="size-4" /> Simulate Normal Operation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-anomaly hover:text-anomaly"
                onClick={() =>
                  addEntry({ mld: 15, kwh: 400, ph: 7.4, turbidity: 6, bod: 8, cod: 40 })
                }
              >
                <ShieldAlert className="size-4" /> Simulate Falsification Fraud
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-warning hover:text-warning"
                onClick={contaminationEvent}
              >
                <Waves className="size-4" /> Simulate River Contamination Event
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground">
            Critical violation when specific power efficiency drops below{" "}
            <span className="text-mono font-semibold text-foreground">
              {ANOMALY_THRESHOLD} kWh/MLD
            </span>{" "}
            <em>or</em> BOD &gt;{" "}
            <span className="text-mono font-semibold text-foreground">{LIMITS.bod} mg/L</span> or
            turbidity &gt;{" "}
            <span className="text-mono font-semibold text-foreground">
              {LIMITS.turbidity} NTU
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
              tone={latest.falsification ? "anomaly" : "verified"}
              icon={<Gauge className="size-4" />}
            />
            <MetricCard
              label="System Status"
              value={
                <span className="text-base font-bold">
                  {latest.status === "critical"
                    ? latest.falsification
                      ? "⚠️ FALSIFICATION DETECTED"
                      : "⚠️ UNTREATED DUMPING"
                    : latest.status === "warning"
                      ? "⚠️ QUALITY WARNING"
                      : "✅ VERIFIED OPERATIONAL"}
                </span>
              }
              hint={`${criticalCount} critical of ${rows.length} logs`}
              tone={
                latest.status === "critical"
                  ? "anomaly"
                  : latest.status === "warning"
                    ? "warning"
                    : "verified"
              }
              icon={
                latest.status === "pass" ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <ShieldAlert className="size-4" />
                )
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="pH Level"
              value={latest.ph.toFixed(2)}
              unit={`normal ${LIMITS.phMin}–${LIMITS.phMax}`}
              hint={latest.phBreach ? "Outside CPCB range" : "Within CPCB range"}
              tone={latest.phBreach ? "warning" : "verified"}
              icon={<FlaskConical className="size-4" />}
            />
            <MetricCard
              label="Turbidity"
              value={latest.turbidity.toFixed(1)}
              unit="NTU"
              hint={
                latest.turbidity > LIMITS.turbidity
                  ? `Exceeds limit < ${LIMITS.turbidity} NTU`
                  : `Limit < ${LIMITS.turbidity} NTU`
              }
              tone={latest.turbidity > LIMITS.turbidity ? "anomaly" : "verified"}
              icon={<Waves className="size-4" />}
            />
            <MetricCard
              label="BOD"
              value={latest.bod.toFixed(1)}
              unit="mg/L"
              hint={
                latest.bod > LIMITS.bod
                  ? `Exceeds limit < ${LIMITS.bod} mg/L`
                  : `Limit < ${LIMITS.bod} mg/L`
              }
              tone={latest.bod > LIMITS.bod ? "anomaly" : "verified"}
              icon={<Beaker className="size-4" />}
            />
            <MetricCard
              label="COD"
              value={latest.cod.toFixed(0)}
              unit="mg/L"
              hint={
                latest.codBreach
                  ? `Exceeds limit < ${LIMITS.cod} mg/L`
                  : `Limit < ${LIMITS.cod} mg/L`
              }
              tone={latest.codBreach ? "warning" : "verified"}
              icon={<Beaker className="size-4" />}
            />
          </div>

          <div className="panel-surface rounded-lg p-5">
            <Tabs defaultValue="energy">
              <div className="flex flex-wrap items-center gap-3">
                <TabsList>
                  <TabsTrigger value="energy">Energy vs. Output (Falsification Check)</TabsTrigger>
                  <TabsTrigger value="quality">
                    Water Quality vs. CPCB Standard Limits
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="energy" className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Measured draw against the expected treatment baseline.
                  </p>
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
                <EnergyChart data={rows} />
              </TabsContent>

              <TabsContent value="quality" className="mt-4">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Turbidity and BOD plotted against legal CPCB discharge limits.
                  </p>
                  {latest.dumping ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-anomaly/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-anomaly">
                      <ShieldAlert className="size-3.5" /> Legal limit exceeded
                    </span>
                  ) : null}
                </div>
                <QualityChart data={rows} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="panel-surface rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground">Verification Log</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Full audit trail — green passed all checks, yellow quality warning, red
              falsification or dumping alert.
            </p>
            <LogTable rows={[...rows].reverse()} />
          </div>
        </section>
      </main>
    </div>
  );
}
