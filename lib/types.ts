export interface EndpointStatus {
  id: string;
  name: string;
  url: string;
  isUp: boolean | null;
  lastStatusCode: number | null;
  lastLatencyMs: number;
  uptimeLast24h: number;
  lastCheckedAt: string | null;
}

export interface DashboardSummary {
  totalEndpoints: number;
  upCount: number;
  downCount: number;
  slowCount: number;
  averageUptimeLast30Days: number;
  averageLatencyMs: number;
  endpoints: EndpointStatus[];
}
