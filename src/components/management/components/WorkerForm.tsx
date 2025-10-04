// File: src/components/WorkerForm.tsx
import React from "react";
import type { Worker } from "../../workers/types/types";

interface WorkerFormProps {
  nameInput: string;
  setNameInput: (s: string) => void;
  urlInput: string;
  setUrlInput: (s: string) => void;
  timeInput: string;
  setTimeInput: (s: string) => void;
  matchingWorker?: Worker;
}

export const WorkerForm: React.FC<WorkerFormProps> = ({
  nameInput,
  setNameInput,
  urlInput,
  setUrlInput,
  timeInput,
  setTimeInput,
  matchingWorker,
}) => (
  <div className="w-full">
    <div className="lg:w-[40vw] w-[70vw] space-y-2 flex flex-col mx-auto">
      <input
        className="p-2 border rounded"
        placeholder="Nombre completo del worker"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
      />
      {matchingWorker ? (
        <div className="text-sm text-gray-700">
          🧑‍💼{" "}
          <strong>
            {matchingWorker.trainee
              ?.toUpperCase()
              .includes('DESPEGANDO')
              ? `Despegando - ${matchingWorker.supervisor}` :
              matchingWorker.contract_type.name
              .toUpperCase()
              .includes("FULL TIME") ||
            matchingWorker.contract_type.name
              .toUpperCase()
              .includes("PART TIME")
              ? `Agente Concentrix - ${matchingWorker.supervisor}` 
              : `Agente Ubycall - ${matchingWorker.supervisor}`}
          </strong>
        </div>
      ) : (
        nameInput.trim() && (
          <div className="text-sm text-red-600">
            ⚠️ No se encontró un worker con ese nombre.
          </div>
        )
      )}
      <input
        className="p-2 border rounded"
        placeholder="URL (p. ej. https://…/event/)"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />
      <input
        className="p-2 border rounded"
        placeholder="Sendbird Today at 8:35:52 AM"
        value={timeInput}
        onChange={(e) => setTimeInput(e.target.value)}
      />
    </div>
  </div>
);
