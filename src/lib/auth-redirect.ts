const configuredAuthRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;
const productionAuthRedirectUrl = "https://pick-my-flick-now.vercel.app/";

export function getAuthRedirectUrl() {
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const url = (configuredAuthRedirectUrl || browserOrigin || productionAuthRedirectUrl).trim();
  return url.endsWith("/") ? url : `${url}/`;
}
