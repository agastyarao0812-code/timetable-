// Outlook "Publish calendar" ICS endpoints usually don't send permissive CORS headers, so this
// direct fetch will often fail in the browser — callers should catch and fall back to the
// paste/upload .ics flow (see icsParser.js).
export async function fetchIcsFromUrl(url) {
  const response = await fetch(url, { mode: "cors", cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.text();
}
