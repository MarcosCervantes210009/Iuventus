const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const router = express.Router();
const multer = require('multer');

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

// app.post("/register", async (req, res) => {
//   try {
//     const { username, name, password, role } = req.body;
//     const pool = await connectToDB();
//     if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

//     const result = await pool.request()
//       .input("usuario", sql.VarChar(50), username)
//       .input("contraseña", sql.VarChar(255), password)
//       .input("nombre", sql.VarChar(100), name)
//       .input("id_rol", sql.Int, role)
//       .input("status", sql.Int, 1)
//       .execute("Register");

//     if (result.rowsAffected[0] === 0) {

//       return res.status(500).json({ message: "Error al crear el usuario en SQL." });
//     }

//     return res.status(201).json({ message: "Usuario registrado con éxito" });
//   } catch (error) {
//     console.error("Error en register:", error);
//     res.status(500).json({ message: "Error en el servidor", error: error.message });
//   }
// });


app.post("/register", async (req, res) => {
  try {
    const { username, name, password, role, subjects } = req.body;
    const pool = await connectToDB();
    if (!pool) return res.status(500).json({ message: "Error en la conexión a la base de datos" });

    // Registrar el usuario
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

    // Obtener el ID del usuario recién registrado
    const userIdQuery = await pool.request()
      .input("usuario", sql.VarChar(50), username)
      .query("SELECT id FROM usuarios WHERE usuario = @usuario");

    if (userIdQuery.recordset.length === 0) {
      return res.status(500).json({ message: "Error al obtener el ID del usuario." });
    }

    const userId = userIdQuery.recordset[0].id; // Usa el nombre correcto de la columna en la BD

    // Insertar las materias en la tabla usuario_materia
    if (subjects && subjects.length > 0) {
      for (const subjectName of subjects) {
        const subjectNameSanitized = subjectName.trim().toLowerCase(); // Sanitiza el nombre de la materia

        // Buscar el ID de la materia por nombre
        const subjectQuery = await pool.request()
          .input("nombre_materia", sql.VarChar(100), subjectNameSanitized)
          .query("SELECT id FROM materias WHERE LOWER(nombre) = @nombre_materia"); // Comparación en minúsculas

        if (subjectQuery.recordset.length === 0) {
          return res.status(400).json({ message: `La materia ${subjectName} no existe` });
        }

        const subjectId = subjectQuery.recordset[0].id;

        // Insertar el ID de la materia en usuario_materia
        await pool.request()
          .input("usuario_id", sql.Int, userId)
          .input("materia_id", sql.Int, subjectId)
          .query("INSERT INTO usuario_materia (usuario_id, materia_id) VALUES (@usuario_id, @materia_id)");
      }
    }

    return res.status(201).json({ message: "Usuario registrado con éxito y materias asignadas" });
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
app.post('/calificaciones', async (req, res) => {
  const { grado, grupo, calificaciones } = req.body;

  if (!grado || !grupo || !calificaciones || !Array.isArray(calificaciones) || calificaciones.length === 0) {
    return res.status(400).json({ message: "Faltan datos: grado, grupo o calificaciones" });
  }

  // Obtener el usuario que está subiendo las calificaciones (suponiendo que se usa localStorage)
  const usuarioRegistro = req.headers['usuario']; // Puedes obtenerlo desde el encabezado o token

  if (!usuarioRegistro) {
    return res.status(400).json({ message: "El usuario que registra las calificaciones no está identificado" });
  }

  try {
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    const request = transaction.request();

    // Iterar sobre las calificaciones
    for (const calif of calificaciones) {
      // Validación de los campos de calificación
      if (!calif.NombreCompleto || !calif.guia || !calif.examen || !calif.EAT || !calif.AF || !calif.calificacionFinal) {
        continue; // Si algún campo está vacío o no es válido, saltamos ese registro
      }

      // Limpiar los parámetros de la solicitud antes de agregar nuevos valores
      request.parameters = {};  // Limpiar parámetros

      // Declarar los parámetros de forma individual en cada iteración
      request.input("nombreEstudiante", sql.NVarChar, calif.NombreCompleto)
        .input("grado", sql.Int, grado)
        .input("grupo", sql.NVarChar, grupo)
        .input("guia", sql.Float, calif.guia)
        .input("examen", sql.Float, calif.examen)
        .input("EAT", sql.Float, calif.EAT)
        .input("AF", sql.Float, calif.AF)
        .input("calificacionFinal", sql.Float, calif.calificacionFinal)
        .input("usuarioRegistro", sql.NVarChar, usuarioRegistro);  // Añadir usuarioRegistro

      await request.query(`
        INSERT INTO Calificaciones (nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal, usuarioRegistro) 
        VALUES (@nombreEstudiante, @grado, @grupo, @guia, @examen, @EAT, @AF, @calificacionFinal, @usuarioRegistro)
      `);
    }

    await transaction.commit();
    res.status(201).json({ message: "Calificaciones subidas con éxito" });
  } catch (error) {
    console.error("Error al insertar calificaciones:", error);
    res.status(500).json({ message: "Error al subir las calificaciones" });
  }
});



// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marcosca36@gmail.com',
    pass: 'Marcos210009#',
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para enviar el archivo por correo
app.post('/enviarCorreo', upload.single('file'), (req, res) => {
   console.log('Solicitud recibida para enviar correo');
  const file = req.file;
  const mailOptions = {
    from: 'marcosca36@gmail.com',
    to: 'marcosca36@@gmail.com.com', // Cambia esto por el correo destinatario
    subject: 'Calificaciones',
    text: 'Adjunto las calificaciones.',
    attachments: [
      {
        filename: 'calificaciones.xlsx',
        content: file.buffer,
        encoding: 'base64',
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).send('Error al enviar el correo');
    }
    res.status(200).send('Correo enviado correctamente');
  });
});


router.get("/alumnos/:usuario", async (req, res) => {
  const { usuario } = req.params;

  try {
    await sql.connect(config);

    // Primero obtenemos el usuario_id
    const userResult = await sql.query(`
      SELECT id FROM usuarios WHERE usuario = '${usuario}'
    `);

    // Si no encontramos el usuario, respondemos con un error
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuarioId = userResult.recordset[0].id;

    // Luego buscamos los alumnos asociados con ese usuario_id
    const result = await sql.query(`
      SELECT a.ID, a.NombreCompleto, a.Grado, a.Grupo, a.NivelEducativo, m.nombre AS Materia
      FROM alumnos a
      JOIN materias m ON a.Grado = 1 AND a.NivelEducativo = 'secundaria'
      JOIN usuario_materia um ON m.id = um.materia_id
      JOIN usuarios u ON um.usuario_id = u.id
      WHERE u.id = ${usuarioId}
    `);

    // Si no se encontraron alumnos, respondemos con un mensaje
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No se encontraron alumnos" });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener alumnos" });
  } finally {
    sql.close();
  }
});



// Configurar Express para usar las rutas definidas
app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});