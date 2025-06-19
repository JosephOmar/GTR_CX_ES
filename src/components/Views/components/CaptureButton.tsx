// src/components/CaptureButton.tsx
import React, { useState } from "react";
import html2canvas from "html2canvas-pro";
import type { ForecastItem, Totals } from "../types/types";

interface Props {
  data: ForecastItem[];
  totals: Totals;
  timeRange: string[]; // o el tipo que uses realmente
}

export const CaptureButton: React.FC<Props> = ({ data, totals, timeRange }) => {
  const [imgCopied, setImgCopied] = useState(false);
  const [txtCopied, setTxtCopied] = useState(false);

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
            setTimeout(() => setImgCopied(false), 2000);
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

  // Obtener la fecha actual y comprobar si Madrid está en horario de verano
  const currentDate = new Date();

  // Función para comprobar si Madrid está en horario de verano
  const isDST = (date: Date) => {
    // El horario de verano en Madrid comienza el último domingo de marzo y termina el último domingo de octubre
    const startDST = new Date(date.getFullYear(), 2, 31);  // Marzo 31
    const endDST = new Date(date.getFullYear(), 9, 31);   // Octubre 31

    // Ajustamos al último domingo de marzo y octubre
    startDST.setDate(startDST.getDate() - startDST.getDay()); // Último domingo de marzo
    endDST.setDate(endDST.getDate() - endDST.getDay());     // Último domingo de octubre

    return date >= startDST && date <= endDST;
  };

  // Determinar si estamos en horario de verano o estándar en Madrid
  const isMadridDST = isDST(currentDate);
  const offsetMadrid = isMadridDST ? 2 : 1; // 2 horas si está en horario de verano, 1 si no lo está
  const offsetPeru = -5; // Perú está en GMT-5 todo el año

  // Calcular la diferencia horaria entre Madrid y Perú
  const timeDifference = offsetMadrid - offsetPeru;

  // Convertir la hora de Madrid a la hora de Perú (restando la diferencia)
  const [h, m] = lastTime.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h - timeDifference, m); // Restamos la diferencia horaria
  const peruTime = dt.toTimeString().slice(0, 5); // "06:30" o "07:30"

  const totalAht = Number(totals.ahtTotal.toFixed(0)); // segs totales 
  const lastAht = last.aht; // segs último tramo

  const fmt = (sec: number) => {
    const min = Math.floor(sec / 60).toString().padStart(2, "0");
    const seg = (sec % 60).toString().padStart(2, "0");
    return `${min}m ${seg}s`;
  };

  const text = `ASSEMBLED ${lastTime} HE (${peruTime} HP)
🔴 AHT acumulado día :
                ${fmt(totalAht)} - ${totalAht}seg.
Último tramo up: ${lastTime} HE 
                 ${fmt(lastAht)} - ${lastAht}seg 
▶️ SLA acumulado : ${totals.slaTotal.toFixed(1)}%👥 Dato REFERENTE con intervalo de 30 min`;

  navigator.clipboard.writeText(text).then(() => {
    setTxtCopied(true);
    setTimeout(() => setTxtCopied(false), 2000);
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
        onClick={handleTextClick}
        className={`flex-1 p-2 rounded text-white transition ${
          txtCopied ? "bg-blue-500" : "bg-teal-500"
        }`}
      >
        {txtCopied ? "¡Texto Copiado!" : "Copiar Resumen"}
      </button>
    </div>
  );
};
