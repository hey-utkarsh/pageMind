// Shim chrome APIs for development preview outside extension context
if (typeof globalThis.chrome === "undefined" || !globalThis.chrome?.storage) {
  // Use localStorage as persistent backing store for dev preview
  const SHIM_PREFIX = "__pagemind_shim_";

  (globalThis as any).chrome = {
    storage: {
      local: {
        get: (keys: string | string[]) => {
          const result: Record<string, unknown> = {};
          const keyArr = typeof keys === "string" ? [keys] : keys;
          for (const k of keyArr) {
            const val = localStorage.getItem(SHIM_PREFIX + k);
            if (val !== null) result[k] = JSON.parse(val);
          }
          return Promise.resolve(result);
        },
        set: (items: Record<string, unknown>) => {
          for (const [k, v] of Object.entries(items)) {
            localStorage.setItem(SHIM_PREFIX + k, JSON.stringify(v));
          }
          return Promise.resolve();
        },
        remove: (keys: string | string[]) => {
          const keyArr = typeof keys === "string" ? [keys] : keys;
          for (const k of keyArr) localStorage.removeItem(SHIM_PREFIX + k);
          return Promise.resolve();
        },
      },
    },
    runtime: {
      sendMessage: (_msg: unknown, callback?: (resp: unknown) => void) => {
        // Return mock page context in dev
        callback?.({
          title: "Example Page — Development Preview",
          url: "https://example.com/article",
          text: "This is a preview of the PageMind sidebar. In a real browser extension, this would contain the extracted text from the active webpage.",
        });
      },
      onMessage: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
    sidePanel: {
      open: () => Promise.resolve(),
      setPanelBehavior: () => Promise.resolve(),
      setOptions: () => Promise.resolve(),
    },
    action: {
      onClicked: {
        addListener: () => {},
      },
    },
    tabs: {
      query: (_q: unknown, cb: (tabs: unknown[]) => void) => {
        cb([{ id: 1, url: "https://example.com", title: "Example" }]);
      },
    },
    scripting: {
      executeScript: () => Promise.resolve([]),
    },
  };
}
