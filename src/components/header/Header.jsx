// src/components/Header.jsx
import React, { useEffect, useState } from 'react';

export default function Header({ title = 'GTR CX ES' }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload.sub);
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('workers'); // Eliminar workers
    localStorage.removeItem('workers_timestamp'); // Eliminar workers_timestamp
    setUser(null);
    window.location.href = '/login'; // ← redirección clásica
  };

  return (
    <header className="bg-primary shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold ">
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
                  <a href="/views" className="">
                    Views
                  </a>
                </li>
                <li className="">
                  Hi, {user}!
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
