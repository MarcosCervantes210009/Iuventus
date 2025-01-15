import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const TPersonal = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [selectedUpdates, setSelectedUpdates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/alumnos");
        setAlumnos(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize));
      } catch (error) {
        console.error("Error al obtener los alumnos:", error);
      }
    };
    fetchAlumnos();
  }, []);

  const handleInputChange = (id, field, value) => {
    setSelectedUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleCheckboxChange = (id, value) => {
    setSelectedUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: value, comentario: "" },
    }));
  };

  const saveUpdates = async () => {
    const updates = Object.entries(selectedUpdates).filter(
      ([, value]) => value.status
    );

    for (const [id, update] of updates) {
      try {
        await axios.put(`http://localhost:5000/api/alumnos/${id}`, {
          grado: update.grado || "",
          status: update.status,
          comentario: update.comentario || "",
        });
      } catch (error) {
        console.error(`Error al actualizar el alumno ${id}:`, error);
      }
    }

    alert("Actualizaciones guardadas exitosamente");
    window.location.reload();
  };

  const currentAlumnos = alumnos
    .filter(
      (alumno) =>
        alumno.Estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.id.toString().includes(searchTerm)
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const importarDesdeExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const datos = XLSX.utils.sheet_to_json(hoja);

      try {
        await axios.post("http://localhost:5000/api/alumnos/importar", datos);
        alert("Alumnos importados correctamente");
        window.location.reload();
      } catch (error) {
        console.error("Error al importar alumnos:", error);
        alert("Error al importar alumnos");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Trabajo Personal
        </h1>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={importarDesdeExcel}
          className="mb-6"
        />
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        </div>
        <table className="min-w-full border border-gray-200 mb-6">
  <thead>
    <tr>
      <th className="border px-4 py-2">ID</th>
      <th className="border px-4 py-2">Estudiante</th>
      <th className="border px-4 py-2">Grado</th>
      <th className="border px-4 py-2">Estado</th>
      <th className="border px-4 py-2">Comentarios</th>
    </tr>
  </thead>
  <tbody>
    {currentAlumnos.map((alumno) => (
      <tr key={alumno._id}>
        <td className="border px-4 py-2">{alumno.id}</td>
        <td className="border px-4 py-2">{alumno.Estudiante}</td>
        <td className="border px-4 py-2">
          <input
            type="text"
            placeholder={alumno.Grado}
            value={selectedUpdates[alumno.id]?.grado || ""}
            onChange={(e) =>
              handleInputChange(alumno.id, "grado", e.target.value)
            }
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </td>
        <td className="border px-4 py-2 text-center">
          <select
            value={selectedUpdates[alumno.id]?.status || ""}
            onChange={(e) =>
              handleCheckboxChange(alumno.id, e.target.value)
            }
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">Seleccionar</option>
            <option value="Trabajo correctamente">Trabajo correctamente</option>
            <option value="No trabajo">No trabajo</option>
          </select>
        </td>
        <td className="border px-4 py-2">
          {selectedUpdates[alumno.id]?.status === "No trabajo" && (
            <input
              type="text"
              placeholder="Escribe un comentario"
              value={selectedUpdates[alumno.id]?.comentario || ""}
              onChange={(e) =>
                handleInputChange(alumno.id, "comentario", e.target.value)
              }
              className="border rounded px-2 py-1 text-sm w-full"
            />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

        <button
          onClick={saveUpdates}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default TPersonal;
