import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const TPersonal = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const pageSize = 10; // Número de alumnos por página
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/alumnos");
        setAlumnos(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize)); // Calculamos el número total de páginas
      } catch (error) {
        console.error("Error al obtener los alumnos:", error);
      }
    };
    fetchAlumnos();
  }, []);

  // Función para manejar el cambio de página
  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para obtener los alumnos de la página actual
  const currentAlumnos = alumnos
    .filter(
      (alumno) =>
        alumno.Estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.id.toString().includes(searchTerm)
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleComentarioChange = (id, value) => {
    setComentarios((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const agregarComentario = async (id) => {
    if (!comentarios[id]) return;
    try {
      const response = await axios.put(
        `http://localhost:5000/api/alumnos/${id}`,
        { comentario: comentarios[id] }
      );
      setAlumnos((prev) =>
        prev.map((alumno) =>
          alumno.id === id ? response.data.alumno : alumno
        )
      );
      setComentarios((prev) => ({ ...prev, [id]: "" }));
      alert("Comentario agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar comentario", "error");
    }
  };

  const exportarAExcel = () => {
    const datos = alumnos.map((alumno) => ({
      ID: alumno.id || "Sin ID",
      Estudiante: alumno.Estudiante || "Sin nombre",
      Grado: alumno.Grado || "Sin grado",
      Comentarios: Array.isArray(alumno["Comentario TPersonal"])
        ? alumno["Comentario TPersonal"]
            .map((c) => `${c.texto} (${new Date(c.fecha).toLocaleString()})`)
            .join("; ")
        : "Sin comentarios", // Manejar el caso donde no sea un array
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Alumnos");

    XLSX.writeFile(libro, "alumnos.xlsx");
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    // Aquí puedes eliminar el token o cualquier dato relacionado con la sesión
    localStorage.removeItem("usuario"); // O el nombre que hayas usado para almacenar el usuario en localStorage
    navigate("/login"); // Redirige al inicio de sesión
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Trabajo Personal</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/home")}
            className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-4"
          >
            Inicio
          </button>
          <button
            onClick={() => navigate("/tpersonal")}
            className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-4"
          >
            Trabajo Personal
          </button>
          <button
            onClick={() => navigate("/subir")}
            className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-4"
          >
            Subir Calificaciones
          </button>
          <button
            onClick={() => navigate("/pagos")}
            className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-4"
          >
            Pagos
          </button>
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={cerrarSesion}
          className="bg-red-500 text-white px-4 py-2 rounded mt-6 hover:bg-red-600"
        >
          Cerrar Sesión
        </button>

        <button
          onClick={exportarAExcel}
          className="bg-green-500 text-white px-4 py-2 rounded mb-6 hover:bg-green-600"
        >
          Exportar a Excel
        </button>

        {/* Campo de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        </div>

        {alumnos.length === 0 ? (
          <p className="text-gray-600">Cargando alumnos...</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 mb-6">
              <thead>
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Estudiante</th>
                  <th className="border px-4 py-2">Grado</th>
                  <th className="border px-4 py-2">Comentarios</th>
                  <th className="border px-4 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentAlumnos.map((alumno) => (
                  <tr key={alumno._id}>
                    <td className="border px-4 py-2">{alumno.id}</td>
                    <td className="border px-4 py-2">{alumno.Estudiante}</td>
                    <td className="border px-4 py-2">{alumno.Grado}</td>
                    <td className="border px-4 py-2">
                      {alumno["Comentario TPersonal"]?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {alumno["Comentario TPersonal"].map((comentario, index) => (
                            <li key={index}>
                              <span>{comentario.texto}</span>{" "}
                              <span className="text-xs text-gray-500">
                                ({new Date(comentario.fecha).toLocaleString()})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "Sin comentarios"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        placeholder="Agregar comentario"
                        value={comentarios[alumno.id] || ""}
                        onChange={(e) =>
                          handleComentarioChange(alumno.id, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                      <button
                        onClick={() => agregarComentario(alumno.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Guardar Comentario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => changePage(index + 1)}
                  className={`px-4 py-2 border rounded ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TPersonal;
