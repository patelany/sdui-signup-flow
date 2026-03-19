export async function fetchFlowFromApi(userId: string, variant?: 'A' | 'B') {
  const url = new URL(`${import.meta.env.VITE_API_BASE}/flow`);
  url.searchParams.set('userId', userId);

  if (variant) {
    url.searchParams.set('variant', variant);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Failed to fetch flow: ${res.status}`);
  }

  return res.json();
}