import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    } catch (err) {
      console.error("Error copying to clipboard", err);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <button
        onClick={handleCopy}
        className={`mt-4 px-4 py-2 rounded transition duration-200 focus:outline-none ${
          copied
            ? "bg-green-500"
            : "bg-[#cbe2f7] hover:bg-[#509ee3]"
        }`}
      >
        {copied ? "✅ Copiado" : "📋 Copiar"}
      </button>
    </div>
  );
} 