import React, { useState } from "react";
import { useWorkersStore } from "../store/WorkersStore";

export default function UploadWorkersModal({ isOpen, onClose }) {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const { fetchWorkers } = useWorkersStore();

  const requiredFiles = [
    { label: "People Active", expectedPart: "people_active" },
    { label: "People Inactive", expectedPart: "people_inactive" },
    { label: "Scheduling PPP", expectedPart: "scheduling_ppp" },
    { label: "API ID", expectedPart: "api_id" },
    { label: "Master Ubycall", expectedPart: "master_ubycall" },
    { label: "Master Concentrix", expectedPart: "master_concentrix" },
    { label: "Scheduling Ubycall", expectedPart: "scheduling_ubycall" },
  ];

  // ===========================================================
  // ============== SUBIDA MANUAL ==============================
  // ===========================================================

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({
      ...prevFiles,
      [name]: selectedFiles[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}upload-workers/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || "✅ Archivos cargados correctamente.");
        await fetchWorkers(true);
        onClose();
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ ${errorData.detail || "Error al cargar los trabajadores"}`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al cargar los trabajadores");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // ============== CARGA AUTOMÁTICA DESDE GOOGLE DRIVE ========
  // ===========================================================

  const handleAutoUpload = async () => {
    setLoading(true);
    setMessage("🔄 Descargando y procesando archivos desde Google Drive...");
    setProgress(10);

    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}auto-upload-workers/`,
        { method: "POST" }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(
          err.detail || "Error al cargar los trabajadores automáticamente."
        );
      }

      const data = await response.json();
      setProgress(100);
      setMessage(data.message || "✅ Trabajadores actualizados correctamente.");
      await fetchWorkers(true);
      onClose();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // ===========================================================
  // ======================== UI ===============================
  // ===========================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold text-gray-900">Subir Trabajadores</h2>
        <p className="text-sm text-gray-600 mt-2">
          Puedes subir los archivos manualmente o cargarlos automáticamente desde Google Drive.
        </p>

        {/* ---------------- BOTONES SUPERIORES ---------------- */}
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
            {loading ? "Procesando..." : "Cargar desde Google Drive"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>

        {/* ---------------- PROGRESO ---------------- */}
        {loading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {progress}% completado
            </p>
          </div>
        )}

        {/* ---------------- FORMULARIO MANUAL ---------------- */}
        <form onSubmit={handleSubmit}>
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

        {/* ---------------- MENSAJE FINAL ---------------- */}
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
