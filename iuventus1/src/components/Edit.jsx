import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Edit = () => {
  const [users, setUsers] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => setError("Error al cargar los usuarios"));
  }, []);

  // Eliminar usuario
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
      })
      .catch(() => setError("Error al eliminar el usuario"));
  };

  // Actualizar contraseña
  const handleUpdatePassword = (id) => {
    if (!newPassword) {
      setError("Por favor, ingresa una nueva contraseña.");
      return;
    }

    fetch(`http://localhost:5000/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    })
      .then((response) => response.json())
      .then(() => {
        setUsers(users.map((user) => (user._id === id ? { ...user, password: newPassword } : user)));
        setEditUserId(null); // Cierra el formulario de edición
        setNewPassword(""); // Limpia el campo de la nueva contraseña
      })
      .catch(() => setError("Error al actualizar la contraseña"));
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    // Elimina los datos de sesión (por ejemplo, token de autenticación)
    localStorage.removeItem("authToken");
    navigate("/login"); // Redirige al login después de cerrar sesión
  };

  // Regresar al inicio
  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Administrar Usuarios</h1>
        <div className="space-x-4">
          {/* Botón de Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Cerrar sesión
          </button>
          {/* Botón de Regresar al Inicio */}
          <button
            onClick={handleGoHome}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Regresar al Inicio
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="table-auto w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user._id}</td>
              <td className="border p-2">{user.user}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setEditUserId(user._id)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 ml-2"
                >
                  Editar Contraseña
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUserId && (
        <div className="bg-white p-6 rounded shadow-md w-80 mx-auto">
          <h2 className="text-lg font-semibold mb-4">Editar Contraseña</h2>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Nueva contraseña"
          />
          <button
            onClick={() => handleUpdatePassword(editUserId)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Actualizar Contraseña
          </button>
        </div>
      )}
    </div>
  );
};

export default Edit;
