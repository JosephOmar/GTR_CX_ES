import { useEffect, useState } from "react";
import AuthStore from "../store/AuthStore";

const Authentication = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Obtener los valores de autenticación desde el store
  const { isAuthenticated, checkSession } = AuthStore();

  useEffect(() => {
    // Verificamos la sesión al cargar el componente
    checkSession(); // Verificar si el usuario está autenticado

    // Esperar a que `isAuthenticated` se actualice
    const interval = setInterval(() => {
      if (isAuthenticated !== null) {
        if (!isAuthenticated && window.location.pathname !== "/login") {
          // Si no está autenticado, redirigir al login
          window.location.href = "/login";
        } else {
          setIsVerifying(false);
        }
        clearInterval(interval);
      }
    }, 100); // Comprobamos cada 100ms si `isAuthenticated` se ha actualizado

    return () => clearInterval(interval); // Limpiamos el intervalo cuando el componente se desmonte
  }, [checkSession, isAuthenticated]);

  if (isVerifying) {
    return null; // Mostrar nada mientras se verifica el estado
  }

  return children; // Mostrar el contenido si está autenticado
};

export default Authentication;
