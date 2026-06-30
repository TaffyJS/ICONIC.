export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map((value) => titleCase(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
