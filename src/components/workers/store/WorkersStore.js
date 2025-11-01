import { create } from "zustand";
import localforage from "localforage";
import AuthStore from "../../auth/store/AuthStore";

localforage.config({
  name: "GTR-CX-DB",
  storeName: "workers_store",
});

const CACHE_TTL = 480 * 60 * 1000; // 10 minutos

// 🔥 Store global de Workers
export const useWorkersStore = create((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  fetchWorkers: async (forceRefresh = false) => {
    // Verificamos si el usuario está autenticado
    const { isAuthenticated } = AuthStore.getState();

    if (!isAuthenticated) {
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
          set({ workers: cachedWorkers, loading: false });
          return;
        }
      }

      // Si el caché no es válido o se fuerza la actualización
      await localforage.removeItem("workers");
      await localforage.removeItem("workers_timestamp");

      const token = await localforage.getItem("token"); // Obtener el token de localForage
      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      await localforage.setItem("workers", data);
      await localforage.setItem("workers_timestamp", Date.now());

      set({ workers: data, loading: false });
    } catch (err) {
      console.error("❌ Error al obtener workers:", err);
      set({ error: err.message, loading: false });
    }
  },
}));
