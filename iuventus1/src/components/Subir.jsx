import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Importa la librería

const Subir = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [grado, setGrado] = useState("");
  const [grupo, setGrupo] = useState("");
  const [calificaciones, setCalificaciones] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const obtenerAlumnos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/alumnos");
        const data = await response.json();
        setAlumnos(data);
      } catch (error) {
        console.error("Error al obtener los alumnos:", error);
      }
    };
    obtenerAlumnos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token de sesión
    navigate("/login"); // Redirige al login
  };

  const alumnosFiltrados = alumnos.filter(
    (alumno) => alumno.Grado == grado && alumno.Grupo === grupo
  );

  useEffect(() => {
    setCalificaciones(
      alumnosFiltrados.map((alumno) => ({
        ID: alumno.ID,
        NombreCompleto: alumno.NombreCompleto,
        guia: "",
        examen: "",
        EAT: "",
        AF: "",
        calificacionFinal: 0,
      }))
    );
  }, [grado, grupo, alumnos]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setCalificaciones((prev) => {
      const newCalificaciones = [...prev];
      newCalificaciones[index] = {
        ...newCalificaciones[index],
        [name]: value,
      };
      return newCalificaciones;
    });
  };

  const calcularCalificacionFinal = (index) => {
    const { guia, examen, EAT, AF } = calificaciones[index];
    return (
      parseFloat(guia || 0) * 0.3 +
      parseFloat(examen || 0) * 0.3 +
      parseFloat(EAT || 0) * 0.1 +
      parseFloat(AF || 0) * 0.3
    ).toFixed(2);
  };

  const handleSubirCalificaciones = async () => {
    if (calificaciones.length === 0) {
      alert("No hay calificaciones para subir.");
      return;
    }

    const nuevasCalificaciones = calificaciones.map((calif, index) => ({
      ...calif,
      calificacionFinal: calcularCalificacionFinal(index),
    }));

    // Obtener el nombre de usuario desde el localStorage
    const usuario = localStorage.getItem("user");

    try {
      const response = await fetch("http://localhost:5000/calificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "usuario": usuario,  // Enviar el nombre de usuario
        },
        body: JSON.stringify({
          grado: grado,
          grupo: grupo,
          calificaciones: nuevasCalificaciones,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al subir las calificaciones");
      }

      alert("Calificaciones subidas correctamente.");
      setCalificaciones([]);  // Limpiar las calificaciones una vez subidas

      // Generar y descargar el archivo Excel
      const ws = XLSX.utils.json_to_sheet(nuevasCalificaciones);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

      // Crear un enlace para descargar el archivo Excel
      XLSX.writeFile(wb, `calificaciones_${grado}_${grupo}.xlsx`);

    } catch (error) {
      console.error("Error al subir calificaciones:", error);
      alert("Hubo un error al subir las calificaciones.");
    }
  };

  const handleEnviarCorreo = async () => {
    // Generar las calificaciones final
    const nuevasCalificaciones = calificaciones.map((calif, index) => ({
      ...calif,
      calificacionFinal: calcularCalificacionFinal(index),
    }));

    // Crear el archivo Excel
    const ws = XLSX.utils.json_to_sheet(nuevasCalificaciones);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

    // Convertir a binario para enviar como archivo adjunto
    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    const formData = new FormData();
    formData.append("file", new Blob([excelFile], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "calificaciones.xlsx");

    try {
      const response = await fetch("http://localhost:5000/enviarCorreo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al enviar el correo.");
      }

      alert("Correo enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert("Hubo un error al enviar el correo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Menú de navegación */}
      <div className="bg-gray-800 text-white p-4 mb-6">
        <nav className="flex justify-between">
          <div className="text-xl">Iuventus</div>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/home")}
              className="hover:bg-gray-600 px-4 py-2 rounded"
            >
              Inicio
            </button>
            <button
              onClick={() => navigate("/TPersonal")}
              className="hover:bg-gray-600 px-4 py-2 rounded"
            >
              Trabajo Personal
            </button>
            <button
              onClick={handleLogout}
              className="hover:bg-red-600 px-4 py-2 rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Subir Calificaciones
        </h1>

        <div className="mb-4">
          <select
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          >
            <option value="">Seleccione Grado</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <select
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione Grupo</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {calificaciones.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Guía</th>
                <th className="border p-2">Examen</th>
                <th className="border p-2">EAT</th>
                <th className="border p-2">AF</th>
                <th className="border p-2">Calificación Final</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.map((calif, index) => (
                <tr key={calif.ID} className="border">
                  <td className="border p-2">{calif.NombreCompleto}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="guia"
                      value={calif.guia}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="examen"
                      value={calif.examen}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="EAT"
                      value={calif.EAT}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="AF"
                      value={calif.AF}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-2">
                    {calcularCalificacionFinal(index)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleSubirCalificaciones}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Subir Calificaciones
          </button>
          <button
            onClick={handleEnviarCorreo}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Enviar por Correo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subir;
