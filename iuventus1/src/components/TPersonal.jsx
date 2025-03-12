import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const TPersonal = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [selectedUpdates, setSelectedUpdates] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlumnos = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/alumnos");
                setAlumnos(response.data);

                const initialUpdates = response.data.reduce((acc, alumno) => {
                    acc[alumno.id] = { Trabajo: "", Comentario: "" };
                    return acc;
                }, {});
                setSelectedUpdates(initialUpdates);
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

    const saveUpdates = async () => {
        try {
            const updates = Object.entries(selectedUpdates);

            for (const [id, update] of updates) {
                await axios.put(`http://localhost:5000/api/alumnos/${id}`, update);
            }

            alert("Actualizaciones guardadas exitosamente");
            window.location.reload();
        } catch (error) {
            console.error("Error al guardar las actualizaciones:", error);
        }
    };

    const exportToExcel = () => {
        const dataToExport = alumnos.map((alumno) => ({
            ID: alumno.id,
            Nombre: alumno.NombreCompleto,
            Grado: alumno.Grado,
            Grupo: alumno.Grupo,
            NivelEducativo: alumno.NivelEducativo,
            Trabajo: selectedUpdates[alumno.id]?.Trabajo || "No especificado",
            Comentario: selectedUpdates[alumno.id]?.Comentario || "No especificado",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Alumnos");
        XLSX.writeFile(workbook, "Reporte_Alumnos.xlsx");
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); // Elimina el token de sesión
        navigate("/login"); // Redirige al login
    };

    const filteredAlumnos = alumnos.filter(
        (alumno) =>
            (alumno.ID &&
                alumno.NombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (alumno.id && alumno.id.toString().includes(searchTerm))
    );

    const totalPages = Math.ceil(filteredAlumnos.length / pageSize);
    const currentAlumnos = filteredAlumnos.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg relative">
                {/* Botón de Cerrar Sesión */}
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Cerrar Sesión
                </button>

                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Trabajo Personal</h1>
                
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
                            <th className="border px-4 py-2">NombreCompleto</th>
                            <th className="border px-4 py-2">Grado</th>
                            <th className="border px-4 py-2">Grupo</th>
                            <th className="border px-4 py-2">NivelEducativo</th>
                            <th className="border px-4 py-2">Trabajo</th>
                            <th className="border px-4 py-2">Comentario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAlumnos.map((alumno) => (
                            <tr key={alumno.id}>
                                <td className="border px-4 py-2">{alumno.id}</td>
                                <td className="border px-4 py-2">{alumno.NombreCompleto}</td>
                                <td className="border px-4 py-2">{alumno.Grado}</td>
                                <td className="border px-4 py-2">{alumno.Grupo}</td>
                                <td className="border px-4 py-2">{alumno.NivelEducativo}</td>
                                <td className="border px-4 py-2 text-center">
                                    <select
                                        value={selectedUpdates[alumno.id]?.Trabajo || ""}
                                        onChange={(e) => handleInputChange(alumno.id, "Trabajo", e.target.value)}
                                        className="border px-2 py-1 rounded w-full"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Trabajo correctamente">Trabajo correctamente</option>
                                        <option value="No trabajo">No trabajo</option>
                                    </select>
                                </td>
                                <td className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Escribe un comentario"
                                        value={selectedUpdates[alumno.id]?.Comentario || ""}
                                        onChange={(e) => handleInputChange(alumno.id, "Comentario", e.target.value)}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2">Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                        Siguiente
                    </button>
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                    <button
                        onClick={saveUpdates}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Guardar Cambios
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                        Generar Reporte Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TPersonal;
