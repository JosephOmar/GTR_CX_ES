import { create } from "zustand";
import localforage from "localforage";
import AuthStore from "../../auth/store/AuthStore";

// ⚙️ Configuración de IndexedDB
localforage.config({
  name: "GTR-CX-DB",
  storeName: "real_time_data_store",
});

// 🔥 Store global para Real-Time Data
export const useRealTimeDataStore = create((set, get) => ({
  realTimeData: [],
  loading: false,
  error: null,

  // 🚀 Obtener los datos en tiempo real
  fetchRealTimeData: async (forceRefresh = false) => {
    const { isAuthenticated } = AuthStore.getState();

    // Si no hay sesión, limpiar caché
    if (!isAuthenticated) {
      await localforage.removeItem("realTimeData");
      set({ realTimeData: [], loading: false, error: "Sesión expirada" });
      return;
    }

    set({ loading: true, error: null });

    try {
      // ⚡ Cargar desde caché si no se fuerza actualización
      if (!forceRefresh) {
        const cachedData = await localforage.getItem("realTimeData");
        if (cachedData) {
          set({ realTimeData: cachedData, loading: false });
          return;
        }
      }

      // 🧠 Cargar desde backend
      const token = await localforage.getItem("token");
      const res = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}real-time-data/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // 💾 Guardar en IndexedDB
      await localforage.setItem("realTimeData", data);
      set({ realTimeData: data, loading: false });
    } catch (err) {
      console.error("❌ Error al obtener realTimeData:", err);
      set({ error: err.message, loading: false });
    }
  },

  // 🧹 Limpiar datos manualmente (por ejemplo al cerrar sesión)
  clearRealTimeData: async () => {
    await localforage.removeItem("realTimeData");
    set({ realTimeData: [], loading: false, error: null });
  },
}));
