import React, { useState, useEffect, useCallback } from "react";
import { getApiKey, clearApiKey } from "../../utils/storage";
import WelcomeScreen from "./components/WelcomeScreen";
import ConnectScreen from "./components/ConnectScreen";
import ConnectedHeader from "./components/ConnectedHeader";
import ChatThread from "./components/ChatThread";
import MessageInput from "./components/MessageInput";
import PageContextPill from "./components/PageContextPill";
import type { Message } from "../../utils/anthropic";
import { streamChat } from "../../utils/anthropic";

type Screen = "welcome" | "connect" | "chat";

interface PageContext {
  title: string;
  url: string;
  text: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext>({
    title: "",
    url: "",
    text: "",
  });

  // Check for existing key on mount
  useEffect(() => {
    getApiKey().then((key) => {
      if (key) {
        setApiKey(key);
        setScreen("chat");
      }
    });
  }, []);

  // Fetch page context
  const fetchPageContext = useCallback(() => {
    chrome.runtime.sendMessage(
      { type: "GET_PAGE_CONTEXT" },
      (response: PageContext) => {
        if (response) {
          setPageContext((prev) => {
            // Clear conversation if page changed
            if (prev.url && prev.url !== response.url) {
              setMessages([]);
            }
            return response;
          });
        }
      }
    );
  }, []);

  useEffect(() => {
    if (screen === "chat") {
      fetchPageContext();

      // Listen for page navigation
      const listener = (message: { type: string }) => {
        if (message.type === "PAGE_NAVIGATED") {
          fetchPageContext();
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, [screen, fetchPageContext]);

  const handleConnected = (key: string) => {
    setApiKey(key);
    setScreen("chat");
  };

  const handleSignOut = async () => {
    await clearApiKey();
    setApiKey(null);
    setMessages([]);
    setScreen("welcome");
  };

  const buildSystemPrompt = (): string => {
    let prompt =
      "You are PageMind, a helpful AI assistant. You help users understand and interact with web pages.";
    if (pageContext.title && pageContext.text) {
      prompt += `\n\nThe user is reading: "${pageContext.title}" at ${pageContext.url}\n\nPage content:\n${pageContext.text}`;
    }
    return prompt;
  };

  const handleSend = async (text: string) => {
    if (!apiKey || isStreaming) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Add empty assistant message that will be streamed into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await streamChat(
      apiKey,
      buildSystemPrompt(),
      updatedMessages,
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
          }
          return updated;
        });
      },
      () => setIsStreaming(false),
      (error) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${error}`,
          };
          return updated;
        });
        setIsStreaming(false);
      }
    );
  };

  if (screen === "welcome") {
    return <WelcomeScreen onContinue={() => setScreen("connect")} />;
  }

  if (screen === "connect") {
    return (
      <ConnectScreen
        onConnected={handleConnected}
        onBack={() => setScreen("welcome")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ConnectedHeader onSignOut={handleSignOut} />
      <PageContextPill title={pageContext.title} url={pageContext.url} />
      <ChatThread
        messages={messages}
        isStreaming={isStreaming}
        onQuickAction={handleSend}
      />
      <MessageInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
