import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(""); // Para mostrar el usuario

 useEffect(() => {
  const authToken = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");

  if (!authToken) {
    navigate("/login");
  } else {
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUsername(parsedUser.usuario);
        setUserRole(parsedUser.id_rol); // Aquí obtenemos el rol correctamente
        console.log("Parsed User:", parsedUser);
        console.log("Rol del usuario:", parsedUser.id_rol);
      } catch (error) {
        console.error("Error al parsear user:", error);
      }
    }
  }
}, [navigate]);

  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          Bienvenido al Sistema: {username}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex flex-col space-y-4">
        <button
          onClick={() => navigate("/TPersonal")}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Revisar Alumnos
        </button>

        {/* Debugging: mostrar el rol actual */}
        <p>Current User Role: {userRole}</p>

        {/* Mostrar el botón solo si el usuario es Admin (1) o Director (2) */}
        {userRole === 1 || userRole === 2 ? (
          <button
            onClick={() => navigate("/edit")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Administrar Usuarios
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Home;