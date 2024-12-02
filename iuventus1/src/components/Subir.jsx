import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const Subir = () => {
  const [calificaciones, setCalificaciones] = useState({
    nombreEstudiante: "",
    grado: "",
    grupo: "",
    guia: "",
    examen: "",
    EAT: "",
    AF: "",
    calificacionFinal: 0,
  });

  const [calificacionesRegistradas, setCalificacionesRegistradas] = useState([]);

  const navigate = useNavigate();

  // Función para manejar el cambio de los valores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCalificaciones((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para calcular la calificación final automáticamente
  const calcularCalificacionFinal = () => {
    const { guia, examen, EAT, AF } = calificaciones;
    const final =
      parseFloat(guia) * 0.3 +
      parseFloat(examen) * 0.3 +
      parseFloat(EAT) * 0.1 +
      parseFloat(AF) * 0.3;
    return final.toFixed(2); // Redondeamos a 2 decimales
  };

  // Función para enviar las calificaciones al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calcular la calificación final antes de guardar
    const calificacionFinal = calcularCalificacionFinal();

    // Agregar los datos de la calificación al estado de calificaciones registradas
    const newCalificacion = {
      ...calificaciones,
      calificacionFinal, // Usamos la calificación final calculada
    };

    setCalificacionesRegistradas((prev) => [...prev, newCalificacion]);

    // Limpiar los campos del formulario
    setCalificaciones({
      nombreEstudiante: "",
      grado: "",
      grupo: "",
      guia: "",
      examen: "",
      EAT: "",
      AF: "",
      calificacionFinal: 0,
    });
  };

  // Función para generar el archivo Excel
  const generarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(calificacionesRegistradas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

    // Guardar el archivo Excel
    XLSX.writeFile(wb, "calificaciones.xlsx");
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login"); // Redirige al login después de cerrar sesión
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {/* Contenedor de la barra de navegación */}
        <div className="flex justify-between items-center mb-6">
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
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 transition-colors py-2 px-4"
          >
            Cerrar sesión
          </button>
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Subir Calificaciones</h1>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="nombreEstudiante"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del Estudiante
            </label>
            <input
              type="text"
              id="nombreEstudiante"
              name="nombreEstudiante"
              value={calificaciones.nombreEstudiante}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          {/* Resto de los campos de formulario */}
          <div className="mb-4">
            <label
              htmlFor="grado"
              className="block text-sm font-medium text-gray-700"
            >
              Grado
            </label>
            <input
              type="text"
              id="grado"
              name="grado"
              value={calificaciones.grado}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="grupo"
              className="block text-sm font-medium text-gray-700"
            >
              Grupo
            </label>
            <input
              type="text"
              id="grupo"
              name="grupo"
              value={calificaciones.grupo}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="guia"
              className="block text-sm font-medium text-gray-700"
            >
              Calificación Guía
            </label>
            <input
              type="number"
              id="guia"
              name="guia"
              value={calificaciones.guia}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="examen"
              className="block text-sm font-medium text-gray-700"
            >
              Calificación Examen
            </label>
            <input
              type="number"
              id="examen"
              name="examen"
              value={calificaciones.examen}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="EAT"
              className="block text-sm font-medium text-gray-700"
            >
              Entrega a Tiempo
            </label>
            <input
              type="number"
              id="EAT"
              name="EAT"
              value={calificaciones.EAT}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="AF"
              className="block text-sm font-medium text-gray-700"
            >
              Aspectos Formativos
            </label>
            <input
              type="number"
              id="AF"
              name="AF"
              value={calificaciones.AF}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="calificacionFinal"
              className="block text-sm font-medium text-gray-700"
            >
              Calificación Final
            </label>
            <input
              type="number"
              id="calificacionFinal"
              name="calificacionFinal"
              value={calificaciones.calificacionFinal}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Registrar Calificación
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={generarExcel}
            className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Generar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subir;
