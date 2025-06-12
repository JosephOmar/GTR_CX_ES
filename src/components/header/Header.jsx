// src/components/Header.jsx
import React from 'react';

export default function Header({ title = 'GTR Glovo ES' }) {
  return (
    <header className="bg-[#00A082] shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Título */}
        <div className="text-xl font-semibold text-white">
          {title}
        </div>

        {/* Navegación */}
        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            <li>
              <a
                href="/workers"
                className="text-white hover:text-indigo-600 transition-colors"
              >
                Workers
              </a>
            </li>
            <li>
              <a
                href="/operational-view"
                className="text-white hover:text-indigo-600 transition-colors"
              >
                Operational View
              </a>
            </li>
            <li>
              <a
                href="/management"
                className="text-white hover:text-indigo-600 transition-colors"
              >
                Management
              </a>
            </li>
            <li>
              <a
                href="/views"
                className="text-white hover:text-indigo-600 transition-colors"
              >
                Views
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
);
}
