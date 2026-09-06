import React, { useState } from 'react';

export function CopyButton({ text, label = 'Copy Link', copiedLabel = 'Copied to Clipboard!', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (str) => {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.left = '-999999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(ta);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn-copy-link ${copied ? 'btn-copy-link--copied' : ''} ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default CopyButton;
