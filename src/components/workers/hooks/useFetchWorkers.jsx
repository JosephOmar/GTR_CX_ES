import { useState, useEffect } from "react";
import localforage from "localforage";

// 🧩 Configuración de almacenamiento persistente (IndexedDB)
localforage.config({
  name: "GTR-CX-DB",
  storeName: "workers_store",
});

// 🕐 Tiempo de expiración del caché en milisegundos (ej. 10 minutos)
const CACHE_TTL = 10 * 60 * 1000;

// 🧾 Validación del token
function isSessionValid() {
  const token = localStorage.getItem("token");
  return token && !isTokenExpired(token);
}

function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// 🧠 Hook principal
export function useFetchWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 Función para obtener trabajadores (desde caché o backend)
  const fetchWorkersData = async () => {
    const token = localStorage.getItem("token");

    if (!isSessionValid()) {
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
        console.log("✅ Cargando trabajadores desde IndexedDB (caché)");
        setWorkers(cachedWorkers);
        setLoading(false);
        return;
      }

      console.log("🌐 Solicitando trabajadores desde el backend...");
      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // Guardar en IndexedDB
      await localforage.setItem("workers", data);
      await localforage.setItem("workers_timestamp", Date.now());

      console.log("💾 Trabajadores actualizados en caché (IndexedDB)");
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
  }, []);

  return { workers, loading, error, fetchWorkersData };
}