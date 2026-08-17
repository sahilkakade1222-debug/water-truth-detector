import { useCallback, useEffect, useRef, useState } from "react";
import { formatClock, formatStamp, type LogEntry } from "@/lib/stp";

export type StpLiveResponse = {
  timestamp: string;
  power_consumed_kwh: number;
  claimed_flow_mld: number;
  bod: number;
  cod: number;
  tss: number;
  do: number;
  ph: number;
  turbidity: number;
  is_anomaly: boolean;
  anomaly_reason: string;
};

export type UseStpDataResult = {
  /** Latest live readings mapped to the dashboard's LogEntry shape. */
  data: LogEntry[];
  /** True during the initial fetch; false afterward. */
  loading: boolean;
  /** Any fetch or parsing error that occurred. */
  error: Error | null;
  /** Manually trigger a fresh fetch. Resets the polling timer. */
  refetch: () => void;
};

const ENDPOINT = "http://localhost:5000/api/stp/live";
const POLL_INTERVAL_MS = 10_000;

function normalize(entry: StpLiveResponse, index: number): LogEntry {
  const d = new Date(entry.timestamp);
  const valid = !isNaN(d.getTime());
  return {
    id: `live-${valid ? d.getTime() : index}-${index}`,
    timestamp: valid ? formatStamp(d) : entry.timestamp,
    label: valid ? formatClock(d) : entry.timestamp,
    mld: entry.claimed_flow_mld,
    kwh: entry.power_consumed_kwh,
    ph: entry.ph,
    turbidity: entry.turbidity,
    bod: entry.bod,
    cod: entry.cod,
  };
}

export function useStpData(): UseStpDataResult {
  const [data, setData] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchLive = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(ENDPOINT, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`STP live API returned ${response.status}: ${response.statusText}`);
      }

      const raw = (await response.json()) as StpLiveResponse | StpLiveResponse[];
      const array = Array.isArray(raw) ? raw : [raw];
      const normalized = array.map(normalize);

      setData(normalized);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLive();

    const interval = setInterval(() => {
      void fetchLive();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchLive]);

  return { data, loading, error, refetch: fetchLive };
}
