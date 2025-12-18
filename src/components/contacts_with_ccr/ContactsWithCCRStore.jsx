import { create } from "zustand";
import localforage from "localforage";
import AuthStore from "../auth/store/AuthStore";

// ⚙️ Configuración de IndexedDB para Contacts with CCR
localforage.config({
  name: "GTR-CX-DB",
  storeName: "contacts_with_ccr_data_store",
});

// 🔥 Store global para Contacts with CCR
export const useContactsWithCCRStore = create((set, get) => ({
  contactsWithCCRData: [],
  loading: false,
  error: null,

  // 🚀 Obtener los datos de Contacts with CCR
  fetchContactsWithCCRData: async (forceRefresh = false) => {
    const { isAuthenticated } = AuthStore.getState();

    // 🔐 Si no hay sesión, limpiar caché
    if (!isAuthenticated) {
      await localforage.removeItem("contactsWithCCRData");
      set({
        contactsWithCCRData: [],
        loading: false,
        error: "Sesión expirada",
      });
      return;
    }

    set({ loading: true, error: null });

    try {
      // ⚡ Cache first (IndexedDB)
      if (!forceRefresh) {
        const cachedData = await localforage.getItem("contactsWithCCRData");
        if (cachedData) {
          set({ contactsWithCCRData: cachedData, loading: false });
          return;
        }
      }

      // 🧠 Cargar desde backend
      const token = await localforage.getItem("token");

      const res = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}contacts-with-ccr/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // 💾 Guardar en IndexedDB
      await localforage.setItem("contactsWithCCRData", data);
      set({ contactsWithCCRData: data, loading: false });
    } catch (err) {
      console.error("❌ Error al obtener contactsWithCCRData:", err);
      set({ error: err.message, loading: false });
    }
  },

  // 🧹 Limpiar datos manualmente (ej. logout)
  clearContactsWithCCRData: async () => {
    await localforage.removeItem("contactsWithCCRData");
    set({ contactsWithCCRData: [], loading: false, error: null });
  },
}));
