import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: "PageMind",
    description: "Chat with any webpage using Claude",
    version: "1.0.0",
    permissions: ["storage", "activeTab", "scripting"],
    action: {
      default_title: "Open PageMind",
    },
    web_accessible_resources: [
      {
        resources: ["sidepanel.html", "chunks/*", "assets/*"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
