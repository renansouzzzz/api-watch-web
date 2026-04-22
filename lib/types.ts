export interface Plan {
  id: number;
  name: string;
  priceMonthly: number;
  maxEndpoints: number;
  minIntervalSeconds: number;
  historyDays: number;
  hasEmailAlerts: boolean;
  hasWebhooks: boolean;
  hasStatusPage: boolean;
  maxTeamMembers: number;
}

export interface Subscription {
  id: string;
  status: string;
  planName: string;
  planId: number;
  priceMonthly: number;
  maxEndpoints: number;
  minIntervalSeconds: number;
  startedAt: string;
  currentPeriodEnd: string | null;
}

export interface Endpoint {
  id: string;
  name: string;
  url: string;
  intervalSeconds: number;
  timeoutSeconds: number;
  isActive: boolean;
  createdAt: string;
}

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
