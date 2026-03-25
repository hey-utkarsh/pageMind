export function extractPageText(): string {
  // Try semantic containers first
  const selectors = [
    "article",
    "main",
    '[role="main"]',
    ".post-content",
    ".article-content",
    ".entry-content",
  ];

  let container: Element | null = null;
  for (const sel of selectors) {
    container = document.querySelector(sel);
    if (container) break;
  }

  if (!container) {
    container = document.body;
  }

  // Clone to avoid modifying the page
  const clone = container.cloneNode(true) as Element;

  // Remove noise elements
  const noiseSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "nav",
    "footer",
    "header",
    ".ad",
    ".ads",
    ".advertisement",
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    ".sidebar",
    ".comments",
    ".cookie-banner",
    ".popup",
    ".modal",
  ];

  for (const sel of noiseSelectors) {
    clone.querySelectorAll(sel).forEach((el) => el.remove());
  }

  // Get clean text
  const text = (clone.textContent || "")
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Truncate to ~6000 words
  const words = text.split(/\s+/);
  if (words.length > 6000) {
    return words.slice(0, 6000).join(" ") + "…";
  }

  return text;
}

export function getPageInfo(): { title: string; url: string } {
  return {
    title: document.title,
    url: window.location.href,
  };
}
