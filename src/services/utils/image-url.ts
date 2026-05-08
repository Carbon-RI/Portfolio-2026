/**
 * Detects GIF from URL pathname so query strings (?alt=media&token=…) do not affect the result.
 * Firebase Storage URLs encode slashes in the object path; decodeURIComponent normalizes them
 * so the final filename segment (e.g. …/image.gif) can be checked.
 */
export function isGifImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    let pathname = parsed.pathname;
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      /* keep encoded pathname if malformed percent-sequences */
    }
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "";
    return /\.gif$/i.test(lastSegment);
  } catch {
    const withoutQueryOrHash = trimmed.split(/[?#]/)[0] ?? trimmed;
    return /\.gif$/i.test(withoutQueryOrHash);
  }
}
