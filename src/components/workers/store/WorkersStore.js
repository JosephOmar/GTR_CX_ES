  import { create } from "zustand";
  import localforage from "localforage";

  localforage.config({
    name: "GTR-CX-DB",
    storeName: "workers_store",
  });

  const CACHE_TTL = 480 * 60 * 1000; // 10 minutos

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

  // 🔥 Store global
  export const useWorkersStore = create((set, get) => ({
    workers: [],
    loading: false,
    error: null,

    fetchWorkers: async (forceRefresh = false) => {
      const token = localStorage.getItem("token");
      if (!isSessionValid()) {
        set({ workers: [], loading: false, error: "Sesión expirada" });
        return;
      }

      set({ loading: true, error: null });

      try {
        if (!forceRefresh) {
          const cachedWorkers = await localforage.getItem("workers");
          const cachedTimestamp = await localforage.getItem("workers_timestamp");

          const isCacheValid =
            cachedWorkers &&
            cachedTimestamp &&
            Date.now() - cachedTimestamp < CACHE_TTL;

          if (isCacheValid) {
            console.log("✅ Workers desde IndexedDB");
            set({ workers: cachedWorkers, loading: false });
            return;
          }
        }
        await localforage.removeItem("workers");
        await localforage.removeItem("workers_timestamp");
        console.log("🌐 Cargando workers desde backend...");
        const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        await localforage.setItem("workers", data);
        await localforage.setItem("workers_timestamp", Date.now());

        set({ workers: data, loading: false });
        console.log("💾 Workers actualizados");
      } catch (err) {
        console.error("❌ Error al obtener workers:", err);
        set({ error: err.message, loading: false });
      }
    },
  }));
