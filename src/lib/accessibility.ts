type Politeness = "polite" | "assertive";

let liveRegion: HTMLElement | null = null;

const ensureLiveRegion = (politeness: Politeness) => {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", politeness);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute("aria-live", politeness);
  }
  return liveRegion;
};

export const announceToScreenReader = (message: string, politeness: Politeness = "polite") => {
  if (typeof document === "undefined") return;
  const region = ensureLiveRegion(politeness);
  region.textContent = "";
  window.setTimeout(() => {
    region!.textContent = message;
  }, 100);
};

export const trapFocus = (container: HTMLElement) => {
  const focusableSelectors =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  container.addEventListener("keydown", handleKeyDown);
  return () => container.removeEventListener("keydown", handleKeyDown);
};
