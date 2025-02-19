import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    role: "3", // Docente por defecto
    secretKey: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (!formData.termsAccepted) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (["1", "2"].includes(formData.role) && formData.secretKey !== "iuventus2024") {
      setError("Clave secreta incorrecta para roles Admin o Director.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.username,
          name: formData.name,
          password: formData.password,
          termsAccepted: formData.termsAccepted,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Error al registrar el usuario");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        {/* Campo para el usuario */}
        <div className="mb-4">
          <label className="block text-gray-700">Usuario</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        {/* Campo para el nombre */}
        <div className="mb-4">
          <label className="block text-gray-700">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        {/* Campo para la contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
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

        {/* Selección de rol */}
        <div className="mb-4">
          <label className="block text-gray-700">Seleccionar rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">Docente</option>
            <option value="2">Director</option>
            <option value="1">Admin</option>
          </select>
        </div>

        {/* Si el rol no es 3, pide clave secreta */}
        {formData.role !== "3" && (
          <div className="mb-4">
            <label className="block text-gray-700">Clave secreta</label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Clave secreta"
            />
          </div>
        )}

        {/* Aceptar términos */}
        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2"
            />
            Acepto los{" "}
            <button
              type="button"
              onClick={() => window.open("/assets/Terminos.pdf")}
              className="text-blue-500 hover:underline"
            >
              términos y condiciones
            </button>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className={`w-full p-2 rounded ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Crear cuenta"}
        </button>

        {isRegistered && (
          <p className="mt-4 text-green-500">Cuenta creada exitosamente. Serás redirigido al login...</p>
        )}
      </form>
    </div>
  );
};

export default Register;
