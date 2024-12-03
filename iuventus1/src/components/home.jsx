import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si el usuario está autenticado al cargar el componente
    const isAuthenticated = localStorage.getItem("authToken");
    if (!isAuthenticated) {
      navigate("/login"); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  const handleLogout = () => {
    // Elimina los datos de sesión
    localStorage.removeItem("authToken");
    // localStorage.removeItem("userRole"); // Comentado porque ya no se usa
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
        {/* Botones de navegación generales */}
        <button
          onClick={() => navigate("/TPersonal")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Revisar Alumnos
        </button>

        <button
          onClick={() => navigate("/edit")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Administrar Usuarios
        </button>
      </div>
    </div>
  );
};

export default Home;
