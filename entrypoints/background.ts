export default defineBackground(() => {
  // Disable popup — we handle clicks ourselves
  chrome.action.setPopup({ popup: "" });

  // On icon click: try sidePanel first (Chrome/Brave), fall back to iframe injection (Arc)
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    // Try native sidePanel API first
    try {
      if (chrome.sidePanel?.open) {
        await chrome.sidePanel.setOptions({ path: "sidepanel.html" });
        await chrome.sidePanel.open({ tabId: tab.id });
        return;
      }
    } catch {
      // sidePanel not available or failed — use iframe fallback
    }

    // Iframe fallback: tell content script to toggle the sidebar
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
    } catch {
      // Content script not yet injected — inject it first, then toggle
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-scripts/content.js"],
      });
      // Small delay to let script initialize
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id!, { type: "TOGGLE_SIDEBAR" });
      }, 100);
    }
  });

  // Listen for page context requests from sidepanel/iframe
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTEXT") {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (!tab?.id || !tab.url || tab.url.startsWith("chrome://")) {
          sendResponse({ title: "New Tab", url: "", text: "" });
          return;
        }

        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
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
              if (!container) container = document.body;

              const clone = container.cloneNode(true) as Element;
              const noise = [
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
              ];
              for (const sel of noise) {
                clone.querySelectorAll(sel).forEach((el) => el.remove());
              }

              const text = (clone.textContent || "")
                .replace(/\s+/g, " ")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

              const words = text.split(/\s+/);
              const truncated =
                words.length > 6000
                  ? words.slice(0, 6000).join(" ") + "…"
                  : text;

              return {
                title: document.title,
                url: window.location.href,
                text: truncated,
              };
            },
          });

          sendResponse(results[0]?.result || { title: "", url: "", text: "" });
        } catch {
          sendResponse({
            title: tab.title || "",
            url: tab.url || "",
            text: "",
          });
        }
      });

      return true;
    }
  });
});
