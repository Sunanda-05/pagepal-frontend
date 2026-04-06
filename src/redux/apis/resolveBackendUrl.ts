const DEFAULT_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function resolveBackendBaseUrl(): string {
  const configuredUrlRaw = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!configuredUrlRaw) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  // In SSR/non-browser contexts use configured value directly.
  if (typeof window === "undefined") {
    return configuredUrlRaw;
  }

  let parsed: URL;
  try {
    parsed = new URL(configuredUrlRaw);
  } catch {
    return configuredUrlRaw;
  }

  const clientHost = window.location.hostname;
  const isClientRemote = !DEFAULT_HOSTS.has(clientHost);
  const isClientDevTunnel = clientHost.endsWith(".devtunnels.ms");
  const isConfiguredLocalHost = DEFAULT_HOSTS.has(parsed.hostname);

  // On remote devtunnel sessions, route API calls through frontend proxy.
  // This avoids requiring a second backend tunnel to be reachable from mobile.
  if (isClientRemote && isClientDevTunnel && isConfiguredLocalHost) {
    return "/api-proxy";
  }

  return configuredUrlRaw;
}
