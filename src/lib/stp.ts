export const ANOMALY_THRESHOLD = 120;

/** CPCB discharge limits for the Nag River outfall. */
export const LIMITS = {
  phMin: 6.5,
  phMax: 8.5,
  turbidity: 10,
  bod: 10,
  cod: 50,
} as const;

export type LogEntry = {
  id: string;
  timestamp: string;
  label: string;
  mld: number;
  kwh: number;
  ph: number;
  turbidity: number;
  bod: number;
  cod: number;
};

export type Status = "pass" | "warning" | "critical";

export type EvaluatedEntry = LogEntry & {
  ratio: number;
  anomaly: boolean;
  falsification: boolean;
  dumping: boolean;
  phBreach: boolean;
  codBreach: boolean;
  status: Status;
  reasons: string[];
};

export function evaluate(entry: LogEntry): EvaluatedEntry {
  const ratio = entry.mld > 0 ? entry.kwh / entry.mld : 0;
  const falsification = ratio < ANOMALY_THRESHOLD;
  const dumping = entry.bod > LIMITS.bod || entry.turbidity > LIMITS.turbidity;
  const phBreach = entry.ph < LIMITS.phMin || entry.ph > LIMITS.phMax;
  const codBreach = entry.cod > LIMITS.cod;

  const reasons: string[] = [];
  if (falsification) reasons.push("Energy falsification");
  if (entry.bod > LIMITS.bod) reasons.push("BOD over limit");
  if (entry.turbidity > LIMITS.turbidity) reasons.push("Turbidity over limit");
  if (phBreach) reasons.push("pH out of range");
  if (codBreach) reasons.push("COD over limit");

  const status: Status =
    falsification || dumping ? "critical" : phBreach || codBreach ? "warning" : "pass";

  return {
    ...entry,
    ratio,
    anomaly: falsification,
    falsification,
    dumping,
    phBreach,
    codBreach,
    status,
    reasons,
  };
}

export function formatClock(d: Date) {
  return d.toISOString().slice(11, 16) + " UTC";
}

export function formatStamp(d: Date) {
  return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

/** [mld, kwh, ph, turbidity, bod, cod] */
const SEED: Array<[number, number, number, number, number, number]> = [
  [11.2, 2050, 7.2, 4.1, 6.2, 31],
  [10.8, 1960, 7.4, 3.8, 5.8, 28],
  [12.4, 2210, 7.1, 5.2, 7.1, 34],
  [11.9, 2075, 8.7, 6.0, 8.4, 41],
  [13.1, 2380, 7.3, 4.6, 6.9, 33],
  [12.7, 2290, 7.0, 5.5, 7.6, 36],
  [14.6, 520, 7.5, 28.4, 38.2, 96],
  [11.5, 2010, 7.2, 4.9, 6.4, 30],
  [12.2, 2180, 6.9, 12.6, 14.1, 52],
  [10.4, 1885, 7.3, 4.2, 5.9, 29],
];

export function seedLogs(now = Date.now()): LogEntry[] {
  return SEED.map(([mld, kwh, ph, turbidity, bod, cod], i) => {
    const d = new Date(now - (SEED.length - i) * 60 * 60 * 1000);
    return {
      id: `seed-${i}`,
      timestamp: formatStamp(d),
      label: formatClock(d),
      mld,
      kwh,
      ph,
      turbidity,
      bod,
      cod,
    };
  });
}