export function shadeColor(hex: string, percent: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const num = parseInt(value, 16);

  if (Number.isNaN(num)) {
    return hex;
  }

  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const amount = percent / 100;

  const mix = (channel: number) => {
    const target = amount >= 0 ? 255 : 0;
    const mixed = Math.round(channel + (target - channel) * Math.abs(amount));
    return Math.min(255, Math.max(0, mixed));
  };

  return `#${[mix(r), mix(g), mix(b)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}
