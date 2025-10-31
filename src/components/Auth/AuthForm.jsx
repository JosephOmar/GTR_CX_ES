import { useState, useEffect } from "react";
import axios from "axios";
import AuthStore from "./store/AuthStore";
import FormField from "../common/FormField";

const url_backend = import.meta.env.PUBLIC_URL_BACKEND;
axios.defaults.baseURL = url_backend;

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", lastname: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Usamos el store de autenticación
  const { login, isAuthenticated } = AuthStore(); // Obtenemos el estado de autenticación

  // Redirigir al login o al dashboard
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const url = isLogin ? "/login" : "/register";
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (isLogin) {
        const { access_token } = response.data;
        login(access_token); // Usamos el store para guardar el token

        setMessage("¡Inicio de sesión exitoso!");
      } else {
        setMessage("¡Registro exitoso! Ahora puedes iniciar sesión.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Ocurrió un error.");
    }
  };

  useEffect(() => {

    if (isAuthenticated) {
      window.location.replace("/workers"); // Redirigir a la página protegida
    }
  }, [isAuthenticated]); // Se ejecuta cuando isAuthenticated cambia

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h2>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {message && (
          <div className="text-green-500 text-sm text-center">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? null : (
            <div>
              <FormField
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoComplete="name"
              />
              <FormField
                label="Lastname"
                name="lastname"
                type="text"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                required
                autoComplete="lastname"
              />
            </div>
          )}
          <FormField
            label="Email"
            name="email"
            type="text"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {isLogin ? "Entrar" : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
          >
            {isLogin ? "Regístrate" : "Inicia Sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}