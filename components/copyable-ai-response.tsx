'use client';

import { useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';

type CopyableAiResponseProps = {
  content: string;
};

type ParsedResponse = {
  snippet: string | null;
  details: string;
};

const COPY_SNIPPET_START = '---COPY_SNIPPET_START---';
const COPY_SNIPPET_END = '---COPY_SNIPPET_END---';

function parseResponse(content: string): ParsedResponse {
  const startIndex = content.indexOf(COPY_SNIPPET_START);
  const endIndex = content.indexOf(COPY_SNIPPET_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const snippet = content
      .slice(startIndex + COPY_SNIPPET_START.length, endIndex)
      .trim();
    const beforeSnippet = content.slice(0, startIndex).trim();
    const afterSnippet = content.slice(endIndex + COPY_SNIPPET_END.length).trim();
    const details = [beforeSnippet, afterSnippet]
      .filter(Boolean)
      .join('\n\n')
      .replace(/^explanation:\s*/i, '')
      .trim();

    return {
      snippet: snippet || null,
      details: details || snippet || content,
    };
  }

  return { snippet: null, details: content };
}

export function CopyableAiResponse({ content }: CopyableAiResponseProps) {
  const [copied, setCopied] = useState(false);
  const parsed = parseResponse(content);

  const copySnippet = async () => {
    if (!parsed.snippet) return;

    try {
      await navigator.clipboard.writeText(parsed.snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {parsed.snippet && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-[#1DA1F2]/40 bg-zinc-950">
          <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#1DA1F2]">
              Copy snippet
            </span>
            <button
              type="button"
              onClick={copySnippet}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 px-3 py-1 text-xs font-semibold text-gray-200 transition hover:border-[#1DA1F2] hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-sans text-sm leading-relaxed text-white">
            {parsed.snippet}
          </pre>
        </div>
      )}
      <p className="whitespace-pre-wrap">{parsed.details}</p>
    </>
  );
}
