export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    let sidebar: HTMLIFrameElement | null = null;
    let isOpen = false;

    function createSidebar() {
      const iframe = document.createElement("iframe");
      iframe.id = "pagemind-sidebar";
      iframe.src = chrome.runtime.getURL("sidepanel.html");
      iframe.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100vh;
        border: none;
        border-left: 1px solid #e5e7eb;
        z-index: 2147483647;
        background: #fff;
        box-shadow: -2px 0 12px rgba(0,0,0,0.08);
        transition: transform 0.2s ease;
        transform: translateX(0);
      `;
      document.body.appendChild(iframe);
      return iframe;
    }

    function toggle() {
      if (!sidebar) {
        sidebar = createSidebar();
        isOpen = true;
      } else if (isOpen) {
        sidebar.style.transform = "translateX(100%)";
        isOpen = false;
        setTimeout(() => {
          sidebar?.remove();
          sidebar = null;
        }, 200);
      } else {
        sidebar.style.transform = "translateX(0)";
        isOpen = true;
      }
    }

    // Listen for toggle command from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "TOGGLE_SIDEBAR") {
        toggle();
      }
    });

    // Notify sidepanel when page navigation occurs (SPA support)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        chrome.runtime.sendMessage({ type: "PAGE_NAVIGATED", url: lastUrl });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});
