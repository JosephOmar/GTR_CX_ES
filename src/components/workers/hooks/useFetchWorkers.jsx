import { useState, useEffect } from "react";
import localforage from "localforage";
import AuthStore from "../../auth/store/AuthStore";

// 🧩 Configuración de almacenamiento persistente (IndexedDB)
localforage.config({
  name: "GTR-CX-DB",
  storeName: "workers_store",
});

// 🕐 Tiempo de expiración del caché en milisegundos (ej. 10 minutos)
const CACHE_TTL = 10 * 60 * 1000;

export function useFetchWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos el store de autenticación para obtener el estado
  const { isAuthenticated, token } = AuthStore();

  // 🚀 Función para obtener trabajadores (desde caché o backend)
  const fetchWorkersData = async () => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated || !token) {
      setWorkers([]);
      setLoading(false);
      setError("Sesión no válida o expirada");
      return;
    }

    try {
      // 1️⃣ Verificar si hay datos en caché
      const cachedWorkers = await localforage.getItem("workers");
      const cachedTimestamp = await localforage.getItem("workers_timestamp");

      const isCacheValid =
        cachedWorkers &&
        cachedTimestamp &&
        Date.now() - cachedTimestamp < CACHE_TTL;

      if (isCacheValid) {
        setWorkers(cachedWorkers);
        setLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // Guardar en IndexedDB
      await localforage.setItem("workers", data);
      await localforage.setItem("workers_timestamp", Date.now());

      setWorkers(data);
    } catch (err) {
      console.error("❌ Error al cargar trabajadores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Cargar automáticamente al montar el componente
  useEffect(() => {
    fetchWorkersData();
  }, [isAuthenticated, token]); // Dependemos de la autenticación

  return { workers, loading, error, fetchWorkersData };
}