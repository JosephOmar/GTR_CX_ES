import React, { useState } from "react";
import { useWorkersStore } from "../store/WorkersStore";

// Función para calcular las fechas del lunes y domingo de la semana
const getWeekDates = (week) => {
  const currentYear = new Date().getFullYear();

  const firstDayOfYear = new Date(currentYear, 0, 1);
  const dayOfWeek = firstDayOfYear.getDay();
  const daysToThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;

  const firstThursday = new Date(firstDayOfYear);
  firstThursday.setDate(firstDayOfYear.getDate() + daysToThursday);

  const firstMonday = new Date(firstThursday);
  firstMonday.setDate(firstThursday.getDate() - 3);

  const startOfWeek = new Date(firstMonday);
  startOfWeek.setDate(firstMonday.getDate() + (week - 1) * 7);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startDate = startOfWeek.toLocaleDateString("en-GB");
  const endDate = endOfWeek.toLocaleDateString("en-GB");

  return { startDate, endDate };
};

export default function UploadSchedulesModal({ isOpen, onClose }) {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [week, setWeek] = useState("");
  const { fetchWorkers } = useWorkersStore();

  const requiredFiles = [
    { label: "Schedule Concentrix", expectedPart: "schedule_concentrix" },
    { label: "People Obs", expectedPart: "people_obs" },
    { label: "Schedule Ubycall", expectedPart: "schedule_ubycall" },
  ];

  // ================= SUBIDA MANUAL =================

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({
      ...prevFiles,
      [name]: selectedFiles[0],
    }));
  };

  const handleWeekChange = (e) => {
    setWeek(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!week) {
      setMessage("❌ Debes seleccionar una semana");
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < requiredFiles.length; i++) {
      const key = `file${i + 1}`;
      const file = files[key];
      const expected = requiredFiles[i].expectedPart;

      if (!file) {
        setMessage(`❌ Falta el archivo: ${requiredFiles[i].label}`);
        return;
      }

      if (!file.name.toLowerCase().includes(expected)) {
        setMessage(
          `❌ El archivo para "${requiredFiles[i].label}" debe contener: "${expected}"`
        );
        return;
      }

      formData.append("files", file);
    }

    formData.append("week", week);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}upload-schedules/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        await fetchWorkers(true);
        onClose();
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ ${errorData.detail || "Error al cargar los horarios"}`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO DESDE GOOGLE DRIVE =================

  const handleAutoUpload = async () => {
    setLoading(true);
    setMessage("🔄 Descargando y procesando horarios desde Google Drive (semana actual)...");
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}auto-upload-schedules/`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(
          err.detail || "Error al cargar los horarios automáticamente."
        );
      }

      const data = await response.json();
      setMessage(data.message || "✅ Horarios cargados correctamente desde Google Drive.");
      await fetchWorkers(true);
      onClose();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { startDate, endDate } =
    week && Number(week) > 0 ? getWeekDates(Number(week)) : { startDate: "", endDate: "" };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold">Subir Horarios</h2>
        <p className="text-sm text-gray-600 mt-2">
          Puedes subir los archivos manualmente para una semana específica
          o cargarlos automáticamente desde Google Drive usando la semana actual.
        </p>

        {/* Botones superiores */}
        <div className="flex justify-between mt-4 mb-6">
          <button
            type="button"
            onClick={handleAutoUpload}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Procesando..." : "Cargar desde Google Drive (Semana actual)"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>

        {/* Formulario manual */}
        <form onSubmit={handleSubmit} className="mt-2">
          {requiredFiles.map((file, index) => (
            <div key={file.label} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {file.label}
              </label>
              <input
                type="file"
                name={`file${index + 1}`}
                onChange={handleFileChange}
                className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
            </div>
          ))}

          {/* Semana solo para modo manual */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Semana (para subida manual)
            </label>
            <input
              type="number"
              name="week"
              value={week}
              onChange={handleWeekChange}
              className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              min={1}
            />
            {week && (
              <div className="mt-1 text-sm text-gray-500">
                Semana {week}: {startDate} hasta {endDate}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Subiendo..." : "Subir Manualmente"}
            </button>
          </div>
        </form>

        {/* Mensaje */}
        {message && (
          <div
            className={`mt-4 text-sm text-center ${
              message.includes("❌") ? "text-red-600" : "text-gray-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
