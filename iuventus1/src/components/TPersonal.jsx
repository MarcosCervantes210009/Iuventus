import { useState, useEffect } from "react";

const TPersonal = () => {
  const [user, setUser] = useState(null);
  const [alumnos, setAlumnos] = useState([]); // Estado para almacenar alumnos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("Usuario en TPersonal después de parsear:", parsedUser);

      // Llamar a la API para obtener los alumnos
      fetch(`http://localhost:5000/alumnos/${parsedUser.usuario}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al obtener alumnos");
          }
          return response.json();
        })
        .then((data) => {
          setAlumnos(data);
          console.log("Datos de alumnos recibidos:", data);
        })
        .catch((error) => {
          console.error("Error en la petición:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    } else {
      console.log("No hay usuario definido, deteniendo la petición...");
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <h2>Datos del Usuario</h2>
      {user && <p>Usuario: {user.usuario} | Rol: {user.id_rol}</p>}

      <h2>Lista de Alumnos</h2>
      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {alumnos.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Grado</th>
              <th>Grupo</th>
              <th>Nivel Educativo</th>
              <th>Materia</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.ID}>
                <td>{alumno.ID}</td>
                <td>{alumno.NombreCompleto}</td>
                <td>{alumno.Grado}</td>
                <td>{alumno.Grupo}</td>
                <td>{alumno.NivelEducativo}</td>
                <td>{alumno.Materia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No se encontraron alumnos</p>
      )}
    </div>
  );
};

export default TPersonal;
