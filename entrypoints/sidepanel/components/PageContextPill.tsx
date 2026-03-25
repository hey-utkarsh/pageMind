import React from "react";

interface Props {
  title: string;
  url: string;
}

export default function PageContextPill({ title, url }: Props) {
  if (!title && !url) return null;

  const domain = url ? new URL(url).hostname.replace("www.", "") : "";

  return (
    <div className="mx-4 mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-xs font-medium text-gray-700 truncate">
        {title || "Untitled page"}
      </p>
      {domain && (
        <p className="text-[11px] text-gray-400 truncate">{domain}</p>
      )}
    </div>
  );
}
