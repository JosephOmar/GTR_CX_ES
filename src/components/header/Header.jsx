import React, { useEffect, useState } from 'react';
import AuthStore from '../auth/store/AuthStore';

const url_backend = import.meta.env.PUBLIC_URL_BACKEND;

export default function Header({ title = 'GTR SUPPORT' }) {
  const [user, setUser] = useState(null);

  // Obtener el token y la información de autenticación desde el store de Zustand
  const { isAuthenticated, token } = AuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setUser(null);
      return;
    }

    // Si el token es válido, obtenemos la información del usuario desde el backend
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      // Hacer la solicitud al backend para obtener los datos del usuario
      fetch(`${url_backend}users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data)) // Guardamos los datos del usuario
        .catch(() => {
          // Si hay un error, eliminamos el token y la sesión
          AuthStore.getState().logout();
        });
    } catch {
      // Si hay un error al parsear el token, eliminamos la sesión
      AuthStore.getState().logout();
    }
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    AuthStore.getState().logout(); // Llamamos a la acción de logout en el store
    setUser(null);
    window.location.href = '/login'; // Redirigimos al login
  };

  return (
    <header className="bg-primary shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold">
          {title}
        </div>

        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            {user ? (
              <>
                <li>
                  <a href="/workers" className="">
                    Workers
                  </a>
                </li>
                <li>
                  <a href="/operational-view" className="">
                    Operational View
                  </a>
                </li>
                <li>
                  <a href="/management" className="">
                    Management
                  </a>
                </li>
                <li>
                  <a href="/production" className="">
                    Production
                  </a>
                </li>
                <li>
                  <a href="/views" className="">
                    Views
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="">
                    Dashboard
                  </a>
                </li>
                <li className="">
                  Hi, {user?.name}!
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className=""
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <a href="/login" className="">
                  Login
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}