// src/components/Authentication.jsx
import { useEffect } from "react";

const Authentication = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    if (!isAuthenticated && window.location.pathname !== "/login") {
      // Redirigir a la página de login si no está autenticado
      window.location.href = "/login";
    }
  }, []);

  return null; // Este componente no necesita renderizar nada
};

export default Authentication;
