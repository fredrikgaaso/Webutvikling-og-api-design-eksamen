export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed: ${(res.status, res.statusText)}`);
  } else {
    return await res.json();
  }
}
