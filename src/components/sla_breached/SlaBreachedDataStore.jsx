import { create } from "zustand";
import localforage from "localforage";
import AuthStore from "../auth/store/AuthStore";

// ⚙️ Configuración de IndexedDB para Sla Breached
localforage.config({
  name: "GTR-CX-DB",
  storeName: "sla_breached_data_store",
});

// 🔥 Store global para SLA Breached Data
export const useSlaBreachedDataStore = create((set, get) => ({
  slaBreachedData: [],
  loading: false,
  error: null,

  // 🚀 Obtener los datos de SLA Breached en tiempo real
  fetchSlaBreachedData: async (forceRefresh = false) => {
    const { isAuthenticated } = AuthStore.getState();

    // Si no hay sesión, limpiar caché
    if (!isAuthenticated) {
      await localforage.removeItem("slaBreachedData");
      set({ slaBreachedData: [], loading: false, error: "Sesión expirada" });
      return;
    }

    set({ loading: true, error: null });

    try {
      // ⚡ Cargar desde caché si no se fuerza actualización
      if (!forceRefresh) {
        const cachedData = await localforage.getItem("slaBreachedData");
        if (cachedData) {
          set({ slaBreachedData: cachedData, loading: false });
          return;
        }
      }

      // 🧠 Cargar desde backend
      const token = await localforage.getItem("token");

      const res = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}sla-breached-data/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // 💾 Guardar en IndexedDB
      await localforage.setItem("slaBreachedData", data);
      set({ slaBreachedData: data, loading: false });
    } catch (err) {
      console.log("❌ Error al obtener slaBreachedData:", err);
      set({ error: err.message, loading: false });
    }
  },

  // 🧹 Limpiar datos manualmente (por ejemplo al cerrar sesión)
  clearSlaBreachedData: async () => {
    await localforage.removeItem("slaBreachedData");
    set({ slaBreachedData: [], loading: false, error: null });
  },
}));
