export function relativeDateLabel(date: string): string {
  const input = new Date(date).getTime();
  if (!Number.isFinite(input)) return "recently";

  const now = Date.now();
  const deltaMs = Math.max(0, now - input);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (deltaMs < hour) {
    const minutes = Math.max(1, Math.floor(deltaMs / (60 * 1000)));
    return `${minutes}m ago`;
  }

  if (deltaMs < day) {
    return `${Math.floor(deltaMs / hour)}h ago`;
  }

  if (deltaMs < day * 2) {
    return "yesterday";
  }

  return `${Math.floor(deltaMs / day)}d ago`;
}

export function isShelfCollectionName(name: string): boolean {
  return name.trim().toLowerCase() === "shelf";
}
