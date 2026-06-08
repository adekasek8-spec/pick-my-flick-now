const configuredAuthRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;

export function getAuthRedirectUrl() {
  const fallback = typeof window !== "undefined" ? window.location.origin : "";
  const url = (configuredAuthRedirectUrl || fallback).trim();
  if (!url) return "/";
  return url.endsWith("/") ? url : `${url}/`;
}
