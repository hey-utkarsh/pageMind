import React, { useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Send } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask about this page..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-gray-400 max-h-[120px]"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-2">
        Powered by Claude &middot; PageMind
      </p>
    </div>
  );
}
