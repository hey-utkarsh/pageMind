import React, { useState } from "react";
import { validateApiKey } from "../../../utils/anthropic";
import { saveApiKey } from "../../../utils/storage";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  onConnected: (key: string) => void;
  onBack: () => void;
}

export default function ConnectScreen({ onConnected, onBack }: Props) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setError("");
    setLoading(true);

    const valid = await validateApiKey(key.trim());

    if (valid) {
      await saveApiKey(key.trim());
      onConnected(key.trim());
    } else {
      setError("Key not recognised — check and try again");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen px-8 pt-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="self-start mb-8 -ml-3 text-gray-400"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Connect your account
        </h1>
        <p className="text-sm text-gray-500">
          Paste your Anthropic API key to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste your Anthropic key
          </label>

          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
              placeholder="sk-ant-api03-..."
              className="pr-14"
              autoFocus
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <Button type="submit" disabled={loading || !key.trim()}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying your account...
            </>
          ) : (
            "Connect account"
          )}
        </Button>
      </form>
    </div>
  );
}
