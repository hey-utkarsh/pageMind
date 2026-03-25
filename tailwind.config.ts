import type { Config } from "tailwindcss";

export default {
  content: [
    "./entrypoints/**/*.{tsx,ts,html}",
    "./components/**/*.{tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#7C3AED",
        "accent-hover": "#6D28D9",
      },
    },
  },
  plugins: [],
} satisfies Config;
