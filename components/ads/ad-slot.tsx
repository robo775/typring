import { AdUnit } from "@/components/ads/ad-unit";

type AdSlotProps = {
  className?: string;
  label: string;
  show?: boolean;
  slot?: string;
};

export function AdSlot({ className = "", label, show = true, slot }: AdSlotProps) {
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!show) {
    return null;
  }

  if (adsEnabled && clientId && slot) {
    return (
      <aside
        aria-label={label}
        className={`min-h-28 overflow-hidden rounded-2xl bg-white/70 p-2 ${className}`}
      >
        <AdUnit clientId={clientId} slot={slot} />
      </aside>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-400 ${className}`}
    >
      {adsEnabled ? `${label}: スロット未設定` : label}
    </aside>
  );
}
