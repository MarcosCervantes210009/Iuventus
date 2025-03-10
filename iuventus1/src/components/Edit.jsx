import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Edit = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [editUsuario, setEditUsuario] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetch("http://localhost:5000/api/usuarios")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setUsuarios([]);
          setError("Error: datos de usuarios inválidos");
        }
      })
      .catch(() => setError("Error al cargar los usuarios"));
  }, []);

  // Eliminar usuario (borrado lógico)
  const handleDelete = (usuario) => {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${usuario}?`)) {
      return;
    }

    fetch(`http://localhost:5000/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: usuario }),
    })
      .then((response) => response.json())
      .then(() => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((u) => u.usuario !== usuario)
        );
      })
      .catch(() => setError("Error al eliminar el usuario"));
  };

  // Actualizar contraseña
  const handleUpdatePassword = (usuario) => {
    if (!usuario) {
      setError("Usuario no válido.");
      return;
    }

    if (!newPassword) {
      setError("Por favor, ingresa una nueva contraseña.");
      return;
    }

    fetch(`http://localhost:5000/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: usuario, password: newPassword }),
    })
      .then((response) => response.json())
      .then(() => {
        alert("Contraseña actualizada correctamente");
        setEditUsuario(null);
        setNewPassword("");
      })
      .catch(() => setError("Error al actualizar la contraseña"));
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
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
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Cerrar sesión
          </button>
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
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(usuarios) && usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <tr key={usuario.usuario}>
                <td className="border p-2">{usuario.usuario}</td>
                <td className="border p-2">{usuario.nombre}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(usuario.usuario)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setEditUsuario(usuario.usuario)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 ml-2"
                  >
                    Editar Contraseña
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center">
                No hay usuarios disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editUsuario && (
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
            onClick={() => handleUpdatePassword(editUsuario)}
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
