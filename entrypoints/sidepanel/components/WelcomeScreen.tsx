import React from "react";
import { Button } from "../../../components/ui/button";
import { MessageSquare } from "lucide-react";

interface Props {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">PageMind</h1>

      <h2 className="text-lg font-medium text-gray-700 mb-2">
        Chat with any page using Claude
      </h2>

      <p className="text-sm text-gray-500 mb-8">
        Connect your Anthropic account to get started
      </p>

      <Button onClick={onContinue} className="w-full max-w-xs">
        Connect with Claude &rarr;
      </Button>

      <p className="text-xs text-gray-400 mt-4 max-w-xs leading-relaxed">
        You'll need an Anthropic API key.{" "}
        <a
          href="https://console.anthropic.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Get one free at console.anthropic.com
        </a>
      </p>
    </div>
  );
}
