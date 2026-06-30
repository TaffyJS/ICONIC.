export async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}
