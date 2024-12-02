import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pagos");
        setPagos(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize));
      } catch (error) {
        console.error("Error al obtener los pagos:", error);
      }
    };

    fetchPagos();
  }, []);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentPagos = pagos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="mt-6">
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
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Pagos</h2>
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr>
            <th className="border px-4 py-2">Alumno</th>
            <th className="border px-4 py-2">Monto</th>
            <th className="border px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {currentPagos.map((pago) => (
            <tr key={pago._id}>
              <td className="border px-4 py-2">{pago.alumno}</td>
              <td className="border px-4 py-2">{pago.monto}</td>
              <td className="border px-4 py-2">{new Date(pago.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2 text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-lg disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagos;
