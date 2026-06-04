type Viewer = {
  subscription_tier?: string | null;
} | null;

export function shouldShowAds(viewer: Viewer) {
  return viewer?.subscription_tier !== "supporter";
}

