interface MonitoringEventBase {
  timestamp: string;
  environment: string;
}

interface ApiMetricEvent extends MonitoringEventBase {
  type: "api-metric";
  url: string;
  method: string;
  duration: number;
  status: number;
  ok: boolean;
}

interface ErrorEvent extends MonitoringEventBase {
  type: "error";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

type MonitoringEvent = ApiMetricEvent | ErrorEvent;

let monitoringEndpoint: string | undefined;
let initialized = false;

const sendEvent = (event: MonitoringEvent) => {
  if (!monitoringEndpoint) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[monitoring]", event);
    }
    return;
  }

  const payload = JSON.stringify(event);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(monitoringEndpoint, payload);
  } else {
    void fetch(monitoringEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }
};

const createBaseEvent = (): MonitoringEventBase => ({
  timestamp: new Date().toISOString(),
  environment: import.meta.env.MODE,
});

export const initMonitoring = () => {
  if (initialized) return;
  monitoringEndpoint = import.meta.env.VITE_MONITORING_ENDPOINT?.trim();
  initialized = true;
};

export const reportApiMetric = (metric: {
  url: string;
  method?: string;
  duration: number;
  status: number;
  ok: boolean;
}) => {
  sendEvent({
    ...createBaseEvent(),
    type: "api-metric",
    url: metric.url,
    method: (metric.method || "GET").toUpperCase(),
    duration: metric.duration,
    status: metric.status,
    ok: metric.ok,
  });
};

export const captureError = (error: Error, context?: Record<string, unknown>) => {
  sendEvent({
    ...createBaseEvent(),
    type: "error",
    message: error.message,
    stack: error.stack,
    context,
  });
};

