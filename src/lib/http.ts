/**
 * POST to an Apps Script Web App from the browser.
 *
 * We use Content-Type: text/plain to keep it a "simple request" so the browser
 * does NOT send a CORS preflight (Apps Script doesn't answer preflights), and
 * redirect: "follow" to chase the script.google.com -> googleusercontent.com hop.
 */
export async function post<T = any>(url: string, body: unknown): Promise<T> {
  if (!url) throw new Error("No endpoint configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
    redirect: "follow",
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Bad response from endpoint: " + text.slice(0, 200));
  }
}
