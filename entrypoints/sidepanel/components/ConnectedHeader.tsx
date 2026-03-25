import React from "react";
import { Button } from "../../../components/ui/button";

interface Props {
  onSignOut: () => void;
}

export default function ConnectedHeader({ onSignOut }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center">
          CL
        </div>
        <span className="text-sm font-medium text-gray-700">Claude</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>

      <Button variant="ghost" size="sm" onClick={onSignOut}>
        Sign out
      </Button>
    </div>
  );
}
