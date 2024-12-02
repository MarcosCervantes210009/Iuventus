import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("3"); // Valor predeterminado: Docente
  const [secretKey, setSecretKey] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if ((role === "1" || role === "2") && secretKey !== "iuventus2024") {
      setError("Clave secreta incorrecta para roles Admin o Director.");
      return;
    }

    const subjectNumbers = subjects.map((subject) => parseInt(subject, 10));

    try {
      setIsSubmitting(true); // Desactiva el botón
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username,
          password,
          termsAccepted,
          role,
          subjects: subjectNumbers,
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
      setIsSubmitting(false); // Reactiva el botón
    }
  };

  const handleSubjectChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSubjects((prev) =>
      e.target.checked
        ? [...prev, value]
        : prev.filter((subject) => subject !== value)
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <div className="mb-4">
          <label className="block text-gray-700">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <div className="mb-4">
          <label className="block text-gray-700">Seleccionar rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">Docente</option>
            <option value="2">Director</option>
            <option value="1">Admin</option>
          </select>
        </div>
        {role === "3" && (
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona las materias que enseñas</label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 1, name: "Español" },
                { id: 2, name: "Matemáticas" },
                { id: 3, name: "Cívica" },
                { id: 4, name: "Química" },
                { id: 5, name: "Biología" },
                { id: 6, name: "Computación" },
                { id: 7, name: "Teatro" },
                { id: 8, name: "Dibujo" },
                { id: 9, name: "Pintura" },
                { id: 10, name: "Deportes" },
              ].map((subject) => (
                <label key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={subject.id}
                    onChange={handleSubjectChange}
                    className="mr-2"
                  />
                  {subject.name}
                </label>
              ))}
            </div>
          </div>
        )}
        {role !== "3" && (
          <div className="mb-4">
            <label className="block text-gray-700">Clave secreta</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Clave secreta"
            />
          </div>
        )}
        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
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
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
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
