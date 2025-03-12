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

  const navigate = useNavigate();

  // Función para manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCalificaciones((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calcular la calificación final
  const calcularCalificacionFinal = () => {
    const { guia, examen, EAT, AF } = calificaciones;
    return (
      parseFloat(guia) * 0.3 +
      parseFloat(examen) * 0.3 +
      parseFloat(EAT) * 0.1 +
      parseFloat(AF) * 0.3
    ).toFixed(2);
  };

  // Función para procesar y exportar la información
  const handleExportarExcel = async () => {
    try {
      const response = await fetch("/Calificacionestest.xlsx"); // Cargar archivo base
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const ws = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir hoja de Excel a JSON
        const datosExistentes = XLSX.utils.sheet_to_json(ws);

        // Agregar nueva calificación
        const nuevaEntrada = {
          ...calificaciones,
          calificacionFinal: calcularCalificacionFinal(),
        };
        datosExistentes.push(nuevaEntrada);

        // Crear nueva hoja de Excel
        const nuevoWs = XLSX.utils.json_to_sheet(datosExistentes);
        XLSX.utils.book_append_sheet(workbook, nuevoWs, "Calificaciones");

        // Convertir workbook a Blob
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const file = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Enviar archivo al backend para su envío por correo
        const formData = new FormData();
        formData.append("archivo", file, "calificaciones_actualizadas.xlsx");

        await fetch("http://localhost:5000/enviar-correo", {
          method: "POST",
          body: formData,
        });

        alert("Archivo enviado correctamente por correo.");
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error al exportar el archivo:", error);
    }

  };
  const handleSubirCalificacion = async () => {
    const nuevaCalificacion = {
      ...calificaciones,
      calificacionFinal: calcularCalificacionFinal(),
    };
  
    try {
      const response = await fetch("http://localhost:5000/calificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCalificacion),
      });
  
      if (!response.ok) {
        throw new Error("Error al subir calificación");
      }
  
      alert("Calificación subida correctamente a la base de datos.");
    } catch (error) {
      console.error("Error al subir calificación:", error);
      alert("Hubo un error al subir la calificación.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Subir Calificaciones</h1>

        <form className="mt-6">
          <input
            type="text"
            name="nombreEstudiante"
            value={calificaciones.nombreEstudiante}
            onChange={handleChange}
            placeholder="Nombre del estudiante"
            className="mb-4 w-full border p-2 rounded"
          />
          <input
            type="text"
            name="grado"
            value={calificaciones.grado}
            onChange={handleChange}
            placeholder="Grado"
            className="mb-4 w-full border p-2 rounded"
          />
          <input
            type="text"
            name="grupo"
            value={calificaciones.grupo}
            onChange={handleChange}
            placeholder="Grupo"
            className="mb-4 w-full border p-2 rounded"
          />
          <input
            type="number"
            name="guia"
            value={calificaciones.guia}
            onChange={handleChange}
            placeholder="Calificación Guía"
            className="mb-4 w-full border p-2 rounded"
          />
         <button
  type="button"
  onClick={handleSubirCalificacion}
  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
>
  Subir a SQL
</button>

        </form>
      </div>
    </div>
  );
};

export default Subir;
