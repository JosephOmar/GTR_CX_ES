import React, { useState } from 'react';
import html2canvas from 'html2canvas-pro';

export const CaptureButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const table = document.getElementById('data-table')!;
    try {
      const canvas = await html2canvas(table);
      canvas.toBlob(async blob => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob! })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) { console.error(e); }
  };

  return (
    <button
      onClick={handleClick}
      className={`mt-4 p-2 rounded text-white transition-all duration-300 ${copied ? 'bg-blue-500' : 'bg-green-500'}`}
    >
      {copied ? '¡Imagen Copiada!' : 'Capturar Imagen de la Tabla'}
    </button>
  );
};
