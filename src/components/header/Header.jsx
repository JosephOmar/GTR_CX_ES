// src/components/Header.jsx
import React, { useEffect, useState } from 'react';

export default function Header({ title = 'GTR Glovo ES' }) {
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
    setUser(null);
    window.location.href = '/login'; // ← redirección clásica
  };

  return (
    <header className="bg-[#00A082] shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold text-white">
          {title}
        </div>

        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            {user ? (
              <>
                <li>
                  <a href="/workers" className="text-white hover:text-indigo-600 transition-colors">
                    Workers
                  </a>
                </li>
                <li>
                  <a href="/operational-view" className="text-white hover:text-indigo-600 transition-colors">
                    Operational View
                  </a>
                </li>
                <li>
                  <a href="/management" className="text-white hover:text-indigo-600 transition-colors">
                    Management
                  </a>
                </li>
                <li>
                  <a href="/views" className="text-white hover:text-indigo-600 transition-colors">
                    Views
                  </a>
                </li>
                <li className="text-white">
                  ¡Hola, {user}!
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-indigo-600 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <a href="/login" className="text-white hover:text-indigo-600 transition-colors">
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
