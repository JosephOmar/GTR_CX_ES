import React, { useState } from "react";
import { useFetchWorkers } from "./useFetchWorkers";
import { useWorkersStore } from "../store/WorkersStore";

export default function UploadAttendanceModal({ isOpen, onClose, onSuccess }) {
  const { fetchWorkers } = useWorkersStore(); 
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Establecer la fecha actual como valor predeterminado

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Debes seleccionar un archivo");
      return;
    }

    // Validación: el nombre debe contener "attendance"
    if (!file.name.toLowerCase().includes("attendance")) {
      setMessage(`❌ El archivo debe contener en su nombre: "attendance"`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_date", date); // Agregar la fecha al formulario

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}upload-attendance/`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setTimeout(() => {
          setMessage("✅ Registros cargados correctamente");
        }, 1200)       
        await fetchWorkers(true); // actualiza el store sin perder el modal
          // cerramos el modal tras mostrar el mensaje brevemente
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ ${errorData.detail || "Error al cargar attendance 1"}`
        );
      }
    } catch (error) {
      console.log(error);
      setMessage("❌ Error al cargar attendance 2");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold">Subir Attendance</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Archivo Attendance
            </label>
            <input
              type="file"
              name="attendance_file"
              onChange={handleFileChange}
              className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

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
