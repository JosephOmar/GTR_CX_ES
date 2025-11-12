import { create } from "zustand";
import localforage from "localforage";
import AuthStore from "../../auth/store/AuthStore";

// ⚙️ Configuración de IndexedDB
localforage.config({
  name: "GTR-CX-DB",
  storeName: "planned_data_store",
});

// 🔥 Store global para PlannedData
export const usePlannedDataStore = create((set, get) => ({
  plannedData: [],
  loading: false,
  error: null,

  // 🚀 Obtener los datos planificados
  fetchPlannedData: async (forceRefresh = false) => {
    const { isAuthenticated } = AuthStore.getState();

    // Si no hay sesión, limpiar todo
    if (!isAuthenticated) {
      await localforage.removeItem("plannedData");
      set({ plannedData: [], loading: false, error: "Sesión expirada" });
      return;
    }

    set({ loading: true, error: null });

    try {
      // ⚡ Si no se fuerza, intentar cargar desde caché
      if (!forceRefresh) {
        const cachedData = await localforage.getItem("plannedData");
        if (cachedData) {
          set({ plannedData: cachedData, loading: false });
          return;
        }
      }

      // 🧠 Si no hay caché o se fuerza actualización
      const token = await localforage.getItem("token");
      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}planned-data/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // 💾 Guardar nuevo resultado en caché
      await localforage.setItem("plannedData", data);
      set({ plannedData: data, loading: false });
    } catch (err) {
      console.error("❌ Error al obtener plannedData:", err);
      set({ error: err.message, loading: false });
    }
  },

  // 🧹 Limpieza manual (por ejemplo al cerrar sesión)
  clearPlannedData: async () => {
    await localforage.removeItem("plannedData");
    set({ plannedData: [], loading: false, error: null });
  },
}));