# PageMind

A Chrome extension that lets you chat with any webpage using Claude. Works on Chrome, Brave, Arc, and all Chromium-based browsers.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue) ![React 18](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## What it does

PageMind adds a sidebar to your browser that lets you ask Claude questions about the page you're reading. It extracts the page content, sends it as context, and streams Claude's response in real time.

- **Summarize articles** — hit "Summarize this page" to get an instant overview
- **Ask questions** — "What are the key arguments in this post?" or "Explain this code"
- **Works everywhere** — native side panel on Chrome/Brave, iframe sidebar on Arc

## How it works

```
┌──────────────────────────────────────────────────────┐
│ Browser Tab                                          │
│                                        ┌────────────┐│
│  Content script extracts               │  Sidebar   ││
│  page text (article, main,             │            ││
│  [role="main"]) and strips             │  Chat UI   ││
│  nav, footer, ads, scripts             │  (React)   ││
│                                        │            ││
│         ┌──────────────┐               │            ││
│         │  Background  │───────────────│            ││
│         │  Service     │  API calls    │            ││
│         │  Worker      │──────────────▶│            ││
│         └──────────────┘  Streaming    └────────────┘│
│                │                                     │
│                ▼                                     │
│     api.anthropic.com                                │
└──────────────────────────────────────────────────────┘
```

## Features

### Auth flow (login-style UX)

The API key entry is wrapped in a connect-your-account flow so it feels like signing into an app, not pasting a developer key.

1. **Welcome screen** — logo, headline, "Connect with Claude" button
2. **Connect screen** — masked password-style input for the API key, validates with a real API ping to Claude Haiku
3. **Connected state** — green dot, "Claude" label, sign out option — then straight into chat

The API key is stored in `chrome.storage.local` and never leaves the browser except to call `api.anthropic.com`.

### Chat interface

- Streaming responses rendered token-by-token
- Page context pill showing current page title + domain
- "Summarize this page" quick action when chat is empty
- Conversation clears on page navigation
- Scrollable message thread with user/assistant styling

### Page context extraction

The content script intelligently extracts readable text:

- Targets `article`, `main`, `[role="main"]`, `.post-content`, `.article-content`, `.entry-content`
- Falls back to `document.body`
- Strips noise: `script`, `style`, `nav`, `footer`, `header`, ads, sidebar, comments
- Truncates to 6,000 words to stay within context limits
- Re-extracts on every page navigation

### Arc compatibility

Arc doesn't support the `chrome.sidePanel` API. PageMind detects this and falls back to injecting an iframe sidebar (380px, fixed right, z-index max) via the content script. The toggle is smooth with a slide animation.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | [WXT](https://wxt.dev) (Manifest V3) |
| Styling | Tailwind CSS + shadcn/ui components |
| API | Anthropic Messages API (streaming) |
| Model | Claude Sonnet 4.5 (chat), Claude Haiku 4.5 (key validation) |
| Storage | `chrome.storage.local` |

## Project structure

```
pageMind/
├── wxt.config.ts              # WXT + manifest config
├── tailwind.config.ts         # Tailwind theme (Claude purple accent)
├── package.json
├── entrypoints/
│   ├── background.ts          # Service worker — icon click, sidePanel/iframe toggle, page context
│   ├── content.ts             # Content script — iframe sidebar injection + SPA navigation detection
│   └── sidepanel/
│       ├── index.html         # Sidebar entry point
│       ├── main.tsx           # React root
│       ├── App.tsx            # Auth state machine (welcome → connect → chat)
│       ├── chrome-shim.ts     # Chrome API shim for dev/preview mode
│       ├── style.css          # Tailwind imports
│       └── components/
│           ├── WelcomeScreen.tsx     # Screen 1 — connect CTA
│           ├── ConnectScreen.tsx     # Screen 2 — key input + validation
│           ├── ConnectedHeader.tsx   # Screen 3 — top bar with status
│           ├── ChatThread.tsx        # Message list + streaming
│           ├── MessageInput.tsx      # Text input + send button
│           └── PageContextPill.tsx   # Current page title + domain
├── components/ui/             # shadcn/ui primitives (button, input, scroll-area)
├── lib/
│   └── utils.ts               # cn() helper for classnames
└── utils/
    ├── anthropic.ts           # API wrapper — validateApiKey() + streamChat()
    ├── storage.ts             # Key read/write/clear via chrome.storage.local
    └── pageContext.ts          # Text extraction helpers
```

## Setup

### Prerequisites

- Node.js 18+
- npm
- An [Anthropic API key](https://console.anthropic.com/)

### Install and build

```bash
git clone https://github.com/hey-utkarsh/pageMind.git
cd pageMind
npm install
npm run build
```

### Load in browser

#### Chrome / Brave / Edge

1. Go to `chrome://extensions` (or `brave://extensions`, `edge://extensions`)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the folder: `pageMind/.output/chrome-mv3`
5. Click the PageMind icon in the toolbar — sidebar opens

#### Arc

1. Go to `arc://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `pageMind/.output/chrome-mv3`
4. Click the **Extensions** (puzzle piece) icon → click **PageMind**
5. The sidebar injects as an iframe on the right side of the page

### Development mode

```bash
npm run dev
```

WXT watches for file changes and hot-reloads. After the first build, reload the extension in `chrome://extensions` to pick up manifest changes.

## Permissions

The extension requests only what it needs:

| Permission | Why |
|-----------|-----|
| `storage` | Save API key locally |
| `activeTab` | Read the current page's content |
| `scripting` | Inject content script for page text extraction |

No background network requests. No analytics. No user accounts. The API key never leaves the browser except to call `api.anthropic.com`.

## Design

- **Width:** 380px fixed sidebar
- **Font:** system-ui stack
- **Accent:** Claude purple (`#7C3AED`)
- **Style:** Flat, minimal — no gradients, no heavy shadows
- **Errors:** Inline red text, never alerts
- **Loading:** Spinner with status text, never blank screens

## License

MIT
