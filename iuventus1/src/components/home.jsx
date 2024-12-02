import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [role, setRole] = useState(null); // Estado para almacenar el rol del usuario
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el rol desde localStorage al cargar el componente
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setRole(parseInt(storedRole)); // Convierte el rol a número
    } else {
      navigate("/login"); // Si no hay rol, redirige al login
    }
  }, [navigate]);

  const handleLogout = () => {
    // Elimina los datos de sesión (por ejemplo, token y rol)
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login"); // Redirige al login después de cerrar sesión
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Bienvenido al Sistema</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Botón Administrar Usuarios: Solo Admin (1) y Director (2) */}
        {(role === 1 || role === 2) && (
          <button
            onClick={() => navigate("/edit")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Administrar Usuarios
          </button>
        )}

        {/* Botón Otras Funcionalidades: Solo Admin (1) y Director (2) */}
        {(role === 1 || role === 2) && (
          <button
            onClick={() => navigate("/TPersonal")}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Otras Funcionalidades
          </button>
        )}

        {/* Botón Otras Funcionalidades: Solo Docente (3) */}
        {role === 3 && (
          <button
            onClick={() => navigate("/TPersonal")}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Revisar Alumnos
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
