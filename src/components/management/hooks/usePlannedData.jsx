import { useState, useEffect } from "react";
import localforage from "localforage";
import AuthStore from "../../Auth/store/AuthStore";// Importamos el store de autenticación

// 🧩 Configuración de almacenamiento persistente (IndexedDB)
localforage.config({
  name: "GTR-CX-DB",
  storeName: "planned_data_store",
});

// 🕐 Tiempo de expiración del caché en milisegundos (ej. 10 minutos)
const CACHE_TTL = 10 * 60 * 1000;

export function usePlannedData() {
  const [plannedData, setPlannedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos el store de autenticación para obtener el estado
  const { isAuthenticated, token } = AuthStore();

  // 🚀 Función para obtener los datos planificados (desde caché o backend)
  const fetchPlannedData = async () => {

    try {
      // 1️⃣ Verificar si hay datos en caché
      const cachedPlannedData = await localforage.getItem("plannedData");
      const cachedTimestamp = await localforage.getItem("planned_timestamp");

      const isCacheValid =
        cachedPlannedData &&
        cachedTimestamp &&
        Date.now() - cachedTimestamp < CACHE_TTL;
      console.log(isCacheValid)
      if (isCacheValid) {
        setPlannedData(cachedPlannedData);
        setLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}planned-data/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      console.log(data)
      // Guardar en IndexedDB
      await localforage.setItem("plannedData", data);

      setPlannedData(data);
    } catch (err) {
      console.error("❌ Error al cargar datos planificados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Cargar automáticamente al montar el componente
  useEffect(() => {
    // Revisa caché al inicio
    const cached = localforage.getItem("plannedData");
    if (cached) {
      setPlannedData(cached);
      setLoading(false);
    }
    // De todas formas intenta refrescar datos
    fetchPlannedData();
  }, [isAuthenticated, token]); // Dependemos de la autenticación

  return { plannedData, loading, error, fetchPlannedData };
}