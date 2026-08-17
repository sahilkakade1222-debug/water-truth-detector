export const ANOMALY_THRESHOLD = 120;

export type LogEntry = {
  id: string;
  timestamp: string;
  label: string;
  mld: number;
  kwh: number;
};

export type EvaluatedEntry = LogEntry & { ratio: number; anomaly: boolean };

export function evaluate(entry: LogEntry): EvaluatedEntry {
  const ratio = entry.mld > 0 ? entry.kwh / entry.mld : 0;
  return { ...entry, ratio, anomaly: ratio < ANOMALY_THRESHOLD };
}

export function formatClock(d: Date) {
  return d.toISOString().slice(11, 16) + " UTC";
}

export function formatStamp(d: Date) {
  return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

const SEED: Array<[number, number]> = [
  [11.2, 2050],
  [10.8, 1960],
  [12.4, 2210],
  [11.9, 2075],
  [13.1, 2380],
  [12.7, 2290],
  [14.6, 520],
  [11.5, 2010],
  [12.2, 2180],
  [10.4, 1885],
];

export function seedLogs(now = Date.now()): LogEntry[] {
  return SEED.map(([mld, kwh], i) => {
    const d = new Date(now - (SEED.length - i) * 60 * 60 * 1000);
    return {
      id: `seed-${i}`,
      timestamp: formatStamp(d),
      label: formatClock(d),
      mld,
      kwh,
    };
  });
}