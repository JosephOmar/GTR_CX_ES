import React, { useState } from "react";
import { useWorkersStore } from "../store/WorkersStore";

// Función para calcular las fechas del lunes y domingo de la semana
const getWeekDates = (week) => {
  const currentYear = new Date().getFullYear();

  // Obtener el primer día del año
  const firstDayOfYear = new Date(currentYear, 0, 1);

  // Calcular el primer jueves del año
  const dayOfWeek = firstDayOfYear.getDay(); // Día de la semana (0 es domingo, 1 es lunes, etc.)
  const daysToThursday = (dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek); // El primer jueves

  const firstThursday = new Date(firstDayOfYear);
  firstThursday.setDate(firstDayOfYear.getDate() + daysToThursday);

  // Ahora obtenemos el primer lunes de la semana 1
  const firstMonday = new Date(firstThursday);
  firstMonday.setDate(firstThursday.getDate() - 3); // Ajuste para el lunes de la semana 1

  // Calcular el inicio (lunes) y fin (domingo) de la semana deseada
  const startOfWeek = new Date(firstMonday);
  startOfWeek.setDate(firstMonday.getDate() + (week - 1) * 7); // Calculamos el lunes de la semana seleccionada

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // El domingo de esa semana

  // Formatear las fechas en formato 'DD/MM/YYYY'
  const startDate = startOfWeek.toLocaleDateString('en-GB'); // Formato: DD/MM/YYYY
  const endDate = endOfWeek.toLocaleDateString('en-GB'); // Formato: DD/MM/YYYY

  return { startDate, endDate };
};

export default function UploadSchedulesModal({ isOpen, onClose }) {
    
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [week, setWeek] = useState(""); // Agregar el estado para la semana
  const {fetchWorkers} = useWorkersStore()

  const requiredFiles = [
    { label: "Schedule Concentrix", expectedPart: "schedule_concentrix" },
    { label: "People Obs", expectedPart: "people_obs" },
    { label: "Schedule Ubycall", expectedPart: "schedule_ubycall" },
  ];

  // Manejar cambio en los archivos
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({
      ...prevFiles,
      [name]: selectedFiles[0],
    }));
  };

  // Manejar cambio en la semana
  const handleWeekChange = (e) => {
    setWeek(e.target.value);
  };

  // Manejar el envío del formulario
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

      formData.append("files", file); // Añadido todos los archivos bajo la clave "files"
    }

    formData.append("week", week); // Agregar el parámetro "week" al FormData
    console.log(week)
    setLoading(true); // Cambiar el estado de carga a true
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
        onClose()
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
      setLoading(false); // Cambiar el estado de carga a false
    }
  };

  if (!isOpen) return null;

  // Obtener las fechas de la semana seleccionada
  const { startDate, endDate } = getWeekDates(Number(week));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] sm:w-[50%]">
        <h2 className="text-lg font-semibold">Subir Horarios</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          {requiredFiles.map(( file , index) => (
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

          {/* Input para la semana */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Semana
            </label>
            <input
              type="number"
              name="week"
              value={week}
              onChange={handleWeekChange}
              className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              min={1}
              required
            />
            {week && (
              <div className="mt-1 text-sm text-gray-500">
                Semana {week}: {startDate} hasta {endDate}
              </div>
            )}
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
