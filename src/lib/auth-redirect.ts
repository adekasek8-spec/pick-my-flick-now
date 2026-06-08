const configuredAuthRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;
const productionAuthRedirectUrl = "https://pick-my-flick-now.vercel.app/";

export function getAuthRedirectUrl() {
  const url = (configuredAuthRedirectUrl || productionAuthRedirectUrl).trim();
  return url.endsWith("/") ? url : `${url}/`;
}
