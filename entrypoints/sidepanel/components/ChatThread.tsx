import React, { useEffect, useRef } from "react";
import type { Message } from "../../../utils/anthropic";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  onQuickAction: (text: string) => void;
}

export default function ChatThread({
  messages,
  isStreaming,
  onQuickAction,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Ask anything about this page
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickAction("Summarize this page")}
        >
          Summarize this page
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" &&
                msg.content === "" &&
                isStreaming &&
                i === messages.length - 1 && <StreamingDots />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </span>
  );
}
