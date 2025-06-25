import React, { useState, useEffect } from 'react';
import axios from 'axios';

const url_backend = import.meta.env.PUBLIC_URL_BACKEND
axios.defaults.baseURL = url_backend;

export default function AuthForm() {
  const [isClient, setIsClient] = useState(false);  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setFormData({ username: '', password: '' });
    setError('');
    setMessage('');
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const url = isLogin ? '/login' : '/register';
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (isLogin) {
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        window.location.href = "/workers"
        setMessage('¡Inicio de sesión exitoso!');
      } else {
        setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ocurrió un error.');
    }
  };

  if (!isClient) return null; 

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-500 text-sm text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-800">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-    lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {isLogin ? 'Entrar' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={toggleMode}
            className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
