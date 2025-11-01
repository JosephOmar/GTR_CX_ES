import { create } from "zustand";
import localforage from "localforage";

// Configurar localForage para el almacenamiento
localforage.config({
  name: "GTR-CX-DB", // Nombre de la base de datos
  storeName: "auth_store", // Nombre de la tienda de datos
});

// Verificar si el token ha expirado
function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// Crear el store de autenticación
const AuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,

  // Función para iniciar sesión
  login: async (token) => {
    try {
      // Guardar el token en localForage
      await localforage.setItem("token", token);
      set({ token, isAuthenticated: true });
    } catch (err) {
      console.error("Error al guardar el token:", err);
    }
  },

  // Función para cerrar sesión
  logout: async () => {
    try {
      // Eliminar el token de localForage
      await localforage.removeItem("token");
      set({ token: null, isAuthenticated: false });
    } catch (err) {
      console.error("Error al eliminar el token:", err);
    }
  },

  // Función para verificar el estado de la autenticación
  checkSession: async () => {
    try {
      // Intentamos obtener el token de localForage (IndexedDB)
      const cachedToken = await localforage.getItem("token");

      if (cachedToken && !isTokenExpired(cachedToken)) {
        set({ token: cachedToken, isAuthenticated: true });
      } else {
        set({ token: null, isAuthenticated: false });
      }
    } catch (err) {
      console.error("Error al verificar la sesión:", err);
      set({ token: null, isAuthenticated: false });
    }
  },
}));

export default AuthStore;
