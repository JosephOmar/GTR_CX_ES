// src/components/CaptureButton.tsx
import React, { useState } from "react";
import html2canvas from "html2canvas-pro";
import type { ForecastItem, Totals } from "../types/types";
import { calculateDeviationAnalysis } from "../utils/data";
import { getMadridToPeruTime } from "../utils/time";
import { toUnicodeBold } from "../../../Management/utils/toUnicodeBold";

interface Props {
  data: ForecastItem[];
  totals: Totals;
  timeRange: string[]; // o el tipo que uses realmente
}

export const CaptureButton: React.FC<Props> = ({ data, totals, timeRange }) => {
  const [imgCopied, setImgCopied] = useState(false);
  const [txtCopied, setTxtCopied] = useState(false);
  const [txtCopiedAnalisys, setTxtCopiedAnalisys] = useState(false);

  // 1) Capturar tabla como imagen
  const handleImageClick = async () => {
    const table = document.getElementById("data-table");
    if (!table) return;

    try {
      const canvas = await html2canvas(table);
      canvas.toBlob((blob) => {
        if (!blob) return;
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": blob })])
          .then(() => {
            setImgCopied(true);
            setTimeout(() => setImgCopied(false), 500);
          });
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 2) Generar y copiar el resumen de texto
  const handleTextClick = () => {
    if (data.length === 0) return;

    const last = data[data.length - 1];
    const lastTime = last.time; // ej. "23:30"

    const peruTime = getMadridToPeruTime(lastTime)

    const totalAht = Number(totals.ahtTotal.toFixed(0)); // segs totales
    const lastAht = last.aht; // segs último tramo

    const fmt = (sec: number) => {
      const min = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const seg = (sec % 60).toString().padStart(2, "0");
      return `${min}m ${seg}s`;
    };

    const text = `${toUnicodeBold(`ASSEMBLED ${lastTime} HE (${peruTime} HP)`)}\n\n`+
        `🔴 ${toUnicodeBold('AHT acumulado día')}\n`+
        `${toUnicodeBold(`⏰ ${fmt(totalAht)} - ${totalAht}seg.`)}\n\n`+
        `${toUnicodeBold(`Último tramo up: ${lastTime} HE`)} \n`+
        `${toUnicodeBold(`⏰ ${fmt(lastAht)} - ${lastAht}seg.`)}\n\n`+
        `${toUnicodeBold(`▶️ SLA acumulado : ${totals.slaTotal.toFixed(1)}%👥`)}\n`+
        `Dato REFERENTE con intervalo de ${toUnicodeBold('30 min')}`

    navigator.clipboard.writeText(text).then(() => {
      setTxtCopied(true);
      setTimeout(() => setTxtCopied(false), 500); 
    });
  };

  const handleTextClickAnalysis = () => {
    if (data.length === 0) return;

    const analysisText = calculateDeviationAnalysis(data); // Llamada a la función para generar el análisis

    // Copiar el texto generado al portapapeles
    navigator.clipboard.writeText(analysisText).then(() => {
      setTxtCopiedAnalisys(true);
      setTimeout(() => setTxtCopiedAnalisys(false), 500);
    });
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleImageClick}
        className={`flex-1 p-2 rounded text-white transition ${
          imgCopied ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {imgCopied ? "¡Imagen Copiada!" : "Capturar Imagen"}
      </button>
        <button
        onClick={handleTextClickAnalysis}
        className={`flex-1 p-2 rounded text-white transition ${txtCopiedAnalisys ? "bg-blue-500" : "bg-teal-500"}`}
      >
        {txtCopiedAnalisys ? "¡Texto Copiado!" : "Resumen Desvio"}
      </button>
      <button
        onClick={handleTextClick}
        className={`flex-1 p-2 rounded text-white transition ${
          txtCopied ? "bg-blue-500" : "bg-teal-500"
        }`}
      >
        {txtCopied ? "¡Texto Copiado!" : "Resumen AHT"}
      </button>
    </div>
  );
};
