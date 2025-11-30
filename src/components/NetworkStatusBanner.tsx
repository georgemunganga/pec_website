import { useEffect, useRef, useState } from "react";
import { AlertTriangle, GaugeCircle, WifiOff } from "lucide-react";
import { SLOW_NETWORK_EVENT, type SlowNetworkDetail } from "@/lib/network-events";

const SLOW_NETWORK_RESET_MS = 7000;

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false));
  const [slowDetail, setSlowDetail] = useState<SlowNetworkDetail | null>(null);
  const slowTimer = useRef<number>();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleSlowNetwork = (event: CustomEvent<SlowNetworkDetail>) => {
      setSlowDetail(event.detail);
      window.clearTimeout(slowTimer.current);
      slowTimer.current = window.setTimeout(() => setSlowDetail(null), SLOW_NETWORK_RESET_MS);
    };

    window.addEventListener(SLOW_NETWORK_EVENT, handleSlowNetwork as EventListener);
    return () => {
      window.removeEventListener(SLOW_NETWORK_EVENT, handleSlowNetwork as EventListener);
      window.clearTimeout(slowTimer.current);
    };
  }, []);

  if (!isOffline && !slowDetail) {
    return null;
  }

  const renderMessage = () => {
    if (isOffline) {
      return (
        <>
          <WifiOff className="w-4 h-4 mr-2" />
          <span className="font-medium">You are offline.</span>
          <span className="ml-1 text-xs text-white/80">
            We will retry automatically once the connection is restored.
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-3 underline text-xs font-semibold"
          >
            Retry now
          </button>
        </>
      );
    }

    if (slowDetail) {
      return (
        <>
          <GaugeCircle className="w-4 h-4 mr-2" />
          <span className="font-medium">Network is slow</span>
          <span className="ml-1 text-xs text-white/80">
            {slowDetail.url} responded in {(slowDetail.duration / 1000).toFixed(1)}s
          </span>
          <button
            type="button"
            onClick={() => setSlowDetail(null)}
            className="ml-3 underline text-xs font-semibold"
          >
            Dismiss
          </button>
        </>
      );
    }

    return (
      <>
        <AlertTriangle className="w-4 h-4 mr-2" />
        <span>Network issue detected</span>
      </>
    );
  };

  return (
    <div className="bg-amber-600 text-white text-sm px-4 py-2 flex items-center justify-center shadow-md z-30">
      {renderMessage()}
    </div>
  );
}

