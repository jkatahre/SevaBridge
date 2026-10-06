/** Builds an ISO timestamp relative to now, so demo data always looks current. */
export function ago({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }): string {
  return new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60_000).toISOString()
}

export function ahead(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

/** Deterministic pseudo-random generator so charts are stable between reloads. */
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
