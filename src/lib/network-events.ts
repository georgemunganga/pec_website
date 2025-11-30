export const SLOW_NETWORK_EVENT = "pec:slow-network" as const;

export interface SlowNetworkDetail {
  url: string;
  duration: number;
  method?: string;
  status?: number;
}

declare global {
  interface WindowEventMap {
    "pec:slow-network": CustomEvent<SlowNetworkDetail>;
  }
}

export const emitSlowNetworkEvent = (detail: SlowNetworkDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SLOW_NETWORK_EVENT, { detail }));
};
