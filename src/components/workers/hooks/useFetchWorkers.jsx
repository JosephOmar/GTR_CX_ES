import { useState, useEffect } from "react";

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

export function useFetchWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkersData = () => {
    const token = localStorage.getItem("token");

    if (!isSessionValid()) {
      setWorkers([]);
      setLoading(false);
      setError("Sesión no válida o expirada");
      return;
    }

    // Eliminar los trabajadores del localStorage antes de hacer la solicitud
    localStorage.removeItem("workers");
    localStorage.removeItem("workers_timestamp");

    // Realizar la solicitud GET
    fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
      headers: {
        // Pasamos el token de sesión en el header
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const activeWorkers = data;
        // .filter(
        //   (worker) => worker.status?.name === "Activo"
        // );
        localStorage.setItem("workers", JSON.stringify(activeWorkers)); // Cambié a localStorage
        localStorage.setItem("workers_timestamp", Date.now().toString()); // Cambié a localStorage

        setWorkers(activeWorkers);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return { workers, loading, error, fetchWorkersData };
}
