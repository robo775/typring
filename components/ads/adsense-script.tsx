import Script from "next/script";

export function AdsenseScript() {
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!adsEnabled || !clientId) {
    return null;
  }

  return (
    <Script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
    />
  );
}

