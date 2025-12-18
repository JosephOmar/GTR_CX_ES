import React, { useState } from "react";
import { useContactsWithCCRStore } from "./ContactsWithCCRStore";

export default function UploadContactsWithCCRModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { fetchContactsWithCCRData } = useContactsWithCCRStore(); // Aquí usas tu store para actualizar los datos de SLA Breached

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Debes seleccionar un archivo");
      return;
    }

    if (!file.name.toLowerCase().includes("contacts_with_ccr")) {
      setMessage('❌ El archivo debe contener en su nombre: "contacts_with_ccr"');
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}upload-contacts-with-ccr/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ ${data.status} - ${data.rows_inserted} registros cargados`);
        await fetchContactsWithCCRData(true); // Refresca los datos después de la carga
        onClose();
      } else {
        const errorData = await response.json();
        setMessage(`❌ ${errorData.detail || "Error al cargar contacts_with_ccr"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold text-gray-800">Subir Contacts With CCR</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Archivo Contacts With CCR
            </label>
            <input
              type="file"
              name="contacts_with_ccr"
              onChange={handleFileChange}
              className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
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