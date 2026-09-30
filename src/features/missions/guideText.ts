/** Keep whole French sentences: a long sentence wraps, it is never clipped. */
export function splitGuideText(text: string, preferredLength = 220): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const sentences = Array.from(
    new Intl.Segmenter('fr', { granularity: 'sentence' }).segment(trimmed),
    ({ segment }) => segment.trim(),
  ).filter(Boolean);
  const pages: string[] = [];
  let page = '';
  for (const sentence of sentences) {
    if (page && page.length + sentence.length + 1 > preferredLength) {
      pages.push(page);
      page = '';
    }
    page = page ? `${page} ${sentence}` : sentence;
  }
  if (page) pages.push(page);
  return pages;
}
