import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    role: "3", // Docente por defecto
    level: "",
    selectedSubjects: [], // Ahora un array para almacenar múltiples materias
    secretKey: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Lista de materias de secundaria (id, nombre, valor)
  const materiasSecundaria = [
    { id: 1, nombre: "Español", valor: 1 },
    { id: 2, nombre: "Matemáticas", valor: 2 },
    { id: 3, nombre: "Educación Artística", valor: 6 },
    { id: 4, nombre: "F.Cívica y Ética", valor: 7 },
    { id: 5, nombre: "Inglés", valor: 3 },
    { id: 6, nombre: "Química", valor: 4 },
    { id: 7, nombre: "Historia", valor: 5 },
    { id: 8, nombre: "Computo", valor: 8 },
    { id: 9, nombre: "Biología", valor: 9 },
    { id: 10, nombre: "Física", valor: 10 },
    { id: 11, nombre: "Geografía", valor: 11 },
  ];

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "selectedSubjects") {
      // Si el checkbox está marcado, agregar la materia, si no, quitarla
      setFormData((prev) => ({
        ...prev,
        selectedSubjects: checked
          ? [...prev.selectedSubjects, value]
          : prev.selectedSubjects.filter((materia) => materia !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación de términos
    if (!formData.termsAccepted) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    // Validación de la contraseña
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    // Validación de clave secreta para Admin o Director
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
          ...formData,
          subjects: formData.selectedSubjects, // Enviamos el array de materias
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
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
        <div className="mb-4">
          <label className="block text-gray-700">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Usuario</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Seleccionar rol</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="3">Docente</option>
            <option value="2">Director</option>
            <option value="1">Admin</option>
          </select>
        </div>

        {formData.role === "3" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700">Nivel educativo</label>
              <select name="level" value={formData.level} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Seleccione un nivel</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Bachillerato">Bachillerato</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>

            {formData.level === "Secundaria" && (
              <div className="mb-4">
                <label className="block text-gray-700">Materias</label>
                <div className="flex flex-col">
                  {materiasSecundaria.map((materia) => (
                    <label key={materia.id} className="flex items-center">
                      <input
                        type="checkbox"
                        name="selectedSubjects"
                        value={materia.nombre}
                        checked={formData.selectedSubjects.includes(materia.nombre)}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {materia.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {["1", "2"].includes(formData.role) && (
          <div className="mb-4">
            <label className="block text-gray-700">Clave secreta</label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        <div className="mb-4 flex items-center">
          <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="mr-2" />
          <label className="text-gray-700">Acepto los términos y condiciones</label>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button type="submit" className="w-full p-2 rounded bg-blue-500 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
};

export default Register;
