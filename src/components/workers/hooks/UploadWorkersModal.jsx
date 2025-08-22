import React, { useState } from "react";
import { useFetchWorkers } from "./useFetchWorkers";

export default function UploadWorkersModal({ isOpen, onClose }) {
  const { workers, loadingW, error, fetchWorkersData } = useFetchWorkers(); 
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false); // Define el estado de carga
  const [message, setMessage] = useState("");

  const requiredFiles = [
    { label: "People Active", expectedPart: "people_active" },
    { label: "People Inactive", expectedPart: "people_inactive" },
    { label: "Scheduling PPP", expectedPart: "scheduling_ppp" },
    { label: "Report Kustomer", expectedPart: "report_kustomer" },
    { label: "Master Glovo", expectedPart: "master_glovo" },
    { label: "Scheduling Ubycall", expectedPart: "scheduling_ubycall" },
  ];

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({
      ...prevFiles,
      [name]: selectedFiles[0], // Asignamos el archivo al key correspondiente
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

      formData.append("files", file); // Añadido todos los archivos bajo la clave "files"
    }

    setLoading(true); // Cambiar el estado de carga a true
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
        setMessage(data.message);
        fetchWorkersData();
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
      setLoading(false); // Cambiar el estado de carga a false
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold">Subir Trabajadores</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          {requiredFiles.map(( file, index) => (
            <div key={file.label} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {file.label}
              </label>
              <input
                type="file"
                name={`file${index + 1}`} // Establecemos el nombre con la clave del archivo
                onChange={handleFileChange}
                className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {loading ? "Cargando..." : "Subir"}
            </button>
          </div>
          {message && (
            <div className="mt-4 text-sm text-center text-gray-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
