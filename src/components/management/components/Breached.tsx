// File: src/components/Breached/index.tsx
import React, { useState } from "react";
import { useWorkerExtraction } from "../hooks/useWorkerExtraction";
import {
  buildAsNoRetomaMessage,
  buildAgilizarChatMessage,
  buildAgilizarMailMessage,
  buildAsNoCierraChatMessage,
  buildAsNoSaludaMessage,
  buildSaludoInTimeMessage
} from "../utils/MessageBuilders";
import { ActionButton } from "./ActionButton";
import { WorkerForm } from "./WorkerForm";
import { LoadingOrError } from "../../workers/components/LoadingOrError";

export const Breached: React.FC = () => {
  const [nameInput, setNameInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const { extract, workers, loading, error } = useWorkerExtraction(
    nameInput,
    timeInput
  );

  const inputNormalized = nameInput.split("(")[0].split(":").pop()?.trim().toLowerCase();

  const matchingWorker = workers.find(
    (w) =>
      w.kustomer_name?.toLowerCase() === inputNormalized ||
      w.api_email?.toLowerCase() === inputNormalized
  );

  const actions = [
    {
      label: "As no retoma",
      builder: buildAsNoRetomaMessage,
      colorClass: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Agilizar Chat",
      builder: buildAgilizarChatMessage,
      colorClass: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Agilizar Mail",
      builder: buildAgilizarMailMessage,
      colorClass: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      label: "As no cierra chat",
      builder: buildAsNoCierraChatMessage,
      colorClass: "bg-red-600 hover:bg-red-700",
    },
    {
      label: "As no saluda",
      builder: buildAsNoSaludaMessage,
      colorClass: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "As saludo en tiempo",
      builder: buildSaludoInTimeMessage,
      colorClass: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const handleAction = (builder: any) => {
    const data = extract();
    if (!data) return;
    const message = builder({ ...data, url: urlInput });
    navigator.clipboard
      .writeText(message)
      .catch(() => alert("Error al copiar el texto"));
  };

  if (loading) return <LoadingOrError loading />;
  if (error) return <LoadingOrError error={error} />;

  return (
    <div>
      <h2 className="space-y-8 p-6 text-center text-4xl font-bold">
        Breached
      </h2>
      <div className="p-4 space-y-4 text-xs">
        <WorkerForm
          nameInput={nameInput}
          setNameInput={setNameInput}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          timeInput={timeInput}
          setTimeInput={setTimeInput}
          matchingWorker={matchingWorker}
        />
        <div className="w-full">
          <div className="flex flex-wrap justify-center gap-2 lg:w-[40vw] w-[70vw] mx-auto ">
            {actions.map(({ label, builder, colorClass }) => (
              <ActionButton
                key={label}
                label={label}
                colorClass={colorClass}
                onClick={() => handleAction(builder)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
