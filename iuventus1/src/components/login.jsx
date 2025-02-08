import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Importa el contexto de autenticación

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(); // Marca como autenticado en el contexto

        localStorage.setItem("authToken", data.token); // (Si más adelante usas JWT)
        localStorage.setItem("user", JSON.stringify(data.user)); // Guarda usuario
        localStorage.setItem("role", data.user.role); // Guarda rol del usuario

        console.log("Inicio de sesión exitoso:", data);
        navigate("/home"); // Redirige al home
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="mb-6">
        <img src="/assets/logo.jpg" alt="Logo" className="w-32 h-32 object-contain" />
      </div>
      <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Iniciar sesión
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-blue-500 hover:underline"
        >
          Crear cuenta
        </button>
      </p>
    </div>
  );
};

export default Login;
