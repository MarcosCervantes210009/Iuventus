const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const router = express.Router();
const nodemailer = require("nodemailer");
const stripe = require("stripe")("sk_test_51QOxDnAgPTFOWwmwj35wW58PRRPyRM2ncI561aaTIa9gsnvaRPdIaRnTE5ZrxcuQp9vrRd939U3aimXsd5ZEtn0n00FgSUh2XA");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const config = {
  server: '192.168.100.137',
  database: 'SistemaRoles',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'MarcosIuventus',
    },
  },
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  },
};

// Crear pool de conexiones
let poolPromise;

const connectToDB = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config)
      .then(pool => {
        console.log("Conexión a SQL Server exitosa");
        return pool;
      })
      .catch(err => {
        console.error("Error al conectar a SQL Server:", err);
        poolPromise = null;  // Reiniciar en caso de error
      });
  }
  return poolPromise;
};

connectToDB();

app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    const pool = await connectToDB(); // Usar conexión activa
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request()
      .input("usuario", sql.VarChar(50), user)
      .query("SELECT usuario, contraseña, id_rol FROM Usuarios WHERE usuario = @usuario");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const foundUser = result.recordset[0];

    if (foundUser.contraseña !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        usuario: foundUser.usuario,
        id_rol: foundUser.id_rol,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request()
      .input("usuario", sql.VarChar(50), username)
      .input("contraseña", sql.VarChar(255), password)
      .input("nombre", sql.VarChar(100), name)
      .input("id_rol", sql.Int, role)
      .input("status", sql.Int, 1)
      .execute("Register");

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ message: "Error al crear el usuario en SQL." });
    }

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

app.post("/edit", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request()
      .input("usuario", sql.VarChar(50), username)
      .input("nuevaContraseña", sql.VarChar(255), newPassword)
      .execute("EditPassword");

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ message: "Error al editar la contraseña en SQL." });
    }

    return res.status(200).json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error("Error en edit:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const { username } = req.body;
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request()
      .input("usuario", sql.VarChar(50), username)
      .execute("DeleteUser");

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ message: "Error al eliminar el usuario en SQL." });
    }

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en delete:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request().query("SELECT * FROM Usuarios WHERE status = 1");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error en get usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});

// Rutas de usuarios
router.put("/api/usuarios/:usuario", async (req, res) => {
  const { usuario } = req.params;
  const { password } = req.body;

  try {
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    const result = await pool.request()
      .input("usuario", sql.VarChar(255), usuario)
      .input("password", sql.VarChar(255), password)
      .query("UPDATE Usuarios SET contraseña = @password WHERE usuario = @usuario");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en update usuarios:", error);
    res.status(500).json({ message: "Error al actualizar la contraseña", error: error.message });
  }
});

// Rutas de alumnos
router.get("/api/alumnos", async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request().query("SELECT * FROM alumnos");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los alumnos:", error);
    res.status(500).json({ message: "Error al obtener los alumnos" });
  }
});

router.put("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;

  try {
    const pool = await connectToDB();
    
    const alumno = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Alumnos WHERE id = @id");

    if (alumno.recordset.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    await pool
      .request()
      .input("id_alumno", sql.Int, id)
      .input("comentario", sql.NVarChar(sql.MAX), comentario)
      .input("fecha", sql.DateTime, new Date())
      .query("INSERT INTO Comentarios (id_alumno, comentario, fecha) VALUES (@id_alumno, @comentario, @fecha)");

    res.status(200).json({ message: "Comentario agregado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el comentario:", error);
    res.status(500).json({ message: "Error al actualizar el comentario" });
  }
});

router.get("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectToDB();
    
    const result = await pool
      .request()
      .input("id_alumno", sql.Int, id)
      .query("SELECT comentario, fecha FROM Comentarios WHERE id_alumno = @id_alumno ORDER BY fecha DESC");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No se encontraron comentarios" });
    }

    res.status(200).json({
      message: "Comentarios encontrados",
      comentarios: result.recordset,
    });
  } catch (error) {
    console.error("Error al obtener los comentarios:", error);
    res.status(500).json({ message: "Error al obtener los comentarios" });
  }
});

// Ruta para recibir las calificaciones
router.post("/calificaciones", async (req, res) => {
  const { nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal } = req.body;

  try {
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    await pool.request()
      .input("nombreEstudiante", sql.VarChar(100), nombreEstudiante)
      .input("grado", sql.Int, grado)
      .input("grupo", sql.VarChar(10), grupo)
      .input("guia", sql.Float, guia)
      .input("examen", sql.Float, examen)
      .input("EAT", sql.Float, EAT)
      .input("AF", sql.Float, AF)
      .input("calificacionFinal", sql.Float, calificacionFinal)
      .query("INSERT INTO Calificaciones (nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal) VALUES (@nombreEstudiante, @grado, @grupo, @guia, @examen, @EAT, @AF, @calificacionFinal)");

    res.status(201).json({ message: "Calificación registrada exitosamente" });
  } catch (error) {
    console.error("Error en registro de calificaciones:", error);
    res.status(500).json({ message: "Error al registrar calificación" });
  }
});

// Configuración de transporte para enviar correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tuemail@gmail.com", // Cambia esto por tu correo
    pass: "tucontraseña", // Usa una contraseña de aplicación si usas Gmail
  },
});


// Configurar Express para usar las rutas definidas
app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});