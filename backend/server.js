// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const User = require("./models/user");
// const Alumnos = require('./models/alumnos');
// const stripe = require("stripe")("sk_test_51QOxDnAgPTFOWwmwj35wW58PRRPyRM2ncI561aaTIa9gsnvaRPdIaRnTE5ZrxcuQp9vrRd939U3aimXsd5ZEtn0n00FgSUh2XA");
// const router = express.Router();

// const app = express();
// const PORT = 5000;
const express = require("express");
const cors = require("cors");
// const bcrypt = require("bcrypt");
const sql = require("mssql");
const router = express.Router();
const stripe = require("stripe")("sk_test_51QOxDnAgPTFOWwmwj35wW58PRRPyRM2ncI561aaTIa9gsnvaRPdIaRnTE5ZrxcuQp9vrRd939U3aimXsd5ZEtn0n00FgSUh2XA");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Conexión a MongoDB
// const URI = "mongodb+srv://marcosca36:hNEiYluIxXjaTuHu@cluster0.ugou1.mongodb.net/iuventus";
// mongoose
//   .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Conexión a MongoDB exitosa"))
//   .catch((err) => console.error("Error al conectar a MongoDB:", err));

//   app.post("/login", async (req, res) => {
//     const { user, password } = req.body; // Cambiar de 'username' a 'user'

//   console.log("Datos recibidos:", user, password); // Log para verificar los datos
  
//     try {
// // Buscar el usuario en la colección 'users' por el campo 'user'
//       const foundUser = await User.findOne({ user });

//     console.log("Resultado de la búsqueda:", foundUser); // Log para ver qué encuentra en la DB

//       if (!foundUser) {
//         return res.status(404).json({ message: "Usuario no encontrado" });
//       }
  
//       // Verificar la contraseña
//     if (foundUser.password !== password) {
//         return res.status(401).json({ message: "Contraseña incorrecta" });
//       }
  
//       res.status(200).json({ message: "Login exitoso", user: foundUser });
//     } catch (error) {
// console.error("Error al intentar iniciar sesión:", error);
//       res.status(500).json({ message: "Error interno del servidor" });
//     }
//   });
 
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
    encrypt: false, // Ajusta según sea necesario
    trustServerCertificate: true,
  },
};


sql.connect(config).then(pool => {
  console.log("Conexión a SQL Server exitosa");
  app.locals.pool = pool;  // Guarda la conexión para usarla en las rutas
}).catch(err => {
  console.error("Error al conectar a SQL Server:", err);
});

// app.post("/login", async (req, res) => {
//   const { user, password } = req.body;

//   try {
//     const foundUser = await User.findOne({ user });

//     if (!foundUser) {
//       console.log(`Usuario no encontrado: ${user}`);
//       return res.status(404).json({ message: "Usuario no encontrado" });
//     }

//     if (foundUser.password !== password) {
//       console.log(`Contraseña incorrecta para el usuario: ${user}`);
//       return res.status(401).json({ message: "Contraseña incorrecta" });
//     }

//     // Verifica si el campo role existe en foundUser
//     const userRole = foundUser.role || null;

//     console.log("Inicio de sesión exitoso:", foundUser);
//     return res.status(200).json({
//       message: "Login exitoso",
//       user: {
//         user: foundUser.user,
//         // role: userRole, 
//       },
//     });
//   } catch (error) {
//     console.error("Error interno del servidor:", error);
//     return res.status(500).json({ message: "Error interno del servidor" });
//   }
// });



// app.post("/register", async (req, res) => {
//   const { user, password, termsAccepted, role } = req.body;

//   if (password.length < 8) {
//     return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
//   }

//   if (!termsAccepted) {
//     return res.status(400).json({ message: "Debes aceptar los términos y condiciones." });
//   }

//   try {
//     const existingUser = await User.findOne({ user });
//     if (existingUser) {
//       return res.status(400).json({ message: "El usuario ya existe." });
//     }

//     const newUser = new User({ user, password, role });
//     await newUser.save();

//     res.status(201).json({ message: "Usuario creado exitosamente." });
//   } catch (error) {
//     console.error("Error al registrar el usuario:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// });
// app.post("/login", async (req, res) => {
//   const { user, password } = req.body;

//   try {
//     // Conectar a la base de datos
//     await sql.connect(config);

//     // Consulta SQL para buscar el usuario
//     const result = await sql.query`SELECT usuario, contraseña, id_rol FROM Usuarios WHERE usuario = ${user}`;

//     if (result.recordset.length === 0) {
//       console.log(`Usuario no encontrado: ${user}`);
//       return res.status(404).json({ message: "Usuario no encontrado" });
//     }
    

//     const foundUser = result.recordset[0];

//     if (foundUser.password !== password) {
//       console.log(`Contraseña incorrecta para el usuario: ${user}`);
//       return res.status(401).json({ message: "Contraseña incorrecta" });
//     }

//     console.log("Inicio de sesión exitoso:", foundUser);
//     return res.status(200).json({
//       message: "Login exitoso",
//       user: {
//         user: foundUser.user,
//         role: foundUser.role || null, // Verifica si el rol existe
//       },
//     });
//   } catch (error) {
//     console.error("Error interno del servidor:", error);
//     return res.status(500).json({ message: "Error interno del servidor" });
//   } finally {
//     sql.close(); // Cierra la conexión después de la consulta
//   }
// });
// Asegúrate de que la configuración está bien definida

app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT usuario, contraseña, id_rol FROM Usuarios WHERE usuario = ${user}`;

    if (result.recordset.length === 0) {
      console.log(`Usuario no encontrado: ${user}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const foundUser = result.recordset[0];

    // Comparar la contraseña directamente (sin encriptar)
    if (foundUser.contraseña !== password) {
      console.log(`Contraseña incorrecta para el usuario: ${user}`);
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    console.log("Inicio de sesión exitoso:", foundUser);
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        usuario: foundUser.usuario,
        id_rol: foundUser.id_rol,
      },
    });

  } catch (error) {
    console.error("Error interno del servidor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    sql.close();
  }
});


// app.post("/register", async (req, res) => {
//   const { user, password, termsAccepted, role, subjects } = req.body;

//   console.log("Datos recibidos en el backend:", req.body);  // Verifica que los datos están llegando correctamente

//   if (password.length < 8) {
//     return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
//   }

//   if (!termsAccepted) {
//     return res.status(400).json({ message: "Debes aceptar los términos y condiciones." });
//   }

//   // Validar si el docente ha seleccionado materias
//   if (role === "3" && (!subjects || subjects.length === 0)) {
//     return res.status(400).json({ message: "El docente debe seleccionar al menos una materia." });
//   }

//   // Convertir materias seleccionadas a números
//   const subjectNumbers = subjects.map(subject => parseInt(subject, 10));

//   try {
//     const existingUser = await User.findOne({ user });
//     if (existingUser) {
//       return res.status(400).json({ message: "El usuario ya existe." });
//     }

//     // Crear nuevo usuario con las materias seleccionadas si es un docente
//     const newUser = new User({ user, password, role, subjects: role === "3" ? subjectNumbers : [] });
//     await newUser.save();

//     res.status(201).json({ message: "Usuario creado exitosamente." });
//   } catch (error) {
//     console.error("Error al registrar el usuario:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// });

router.post("/register", async (req, res) => {
  const { user, name, password, role } = req.body;

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("usuario", sql.VarChar(50), user)
      .input("contraseña", sql.VarChar(255), password)
      .input("nombre", sql.VarChar(100), name)
      .input("id_rol", sql.Int, role)
      .input("status", sql.Int, 1) // Siempre envía status = 1
      .execute("Register");

    const insertedId = result.recordset?.[0]?.NuevoUsuarioID;

    return res.status(201).json({ 
      message: "Usuario creado exitosamente.", 
      userId: insertedId 
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
});


router.get("/api/users", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Usuarios");

    res.status(200).json(result.recordset); // Enviar los usuarios como respuesta
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});
  // Ruta para eliminar usuario
  router.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params; // Obtener el ID del usuario
  
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Usuarios WHERE id = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  });
  
  module.exports = router;

  // Ruta para actualizar la contraseña del usuario
  router.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body; // Obtener la nueva contraseña
  
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("password", sql.VarChar(255), password)
        .query("UPDATE Usuarios SET password = @password WHERE id = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
  });
  
  module.exports = router;
  
 

// Obtener todos los alumnos
// Cambios en el backend (server.js)

// app.get('/api/alumnos', async (req, res) => {
//   try {
//     const docenteId = req.user.id; // Asumo que el ID del docente se obtiene con alguna forma de autenticación, por ejemplo, JWT
//     const docente = await Docente.findById(docenteId); // Encuentra el docente por ID
//     if (!docente) {
//       return res.status(404).send('Docente no encontrado');
//     }

//     const gradoDocente = docente.grado; // Suponiendo que el docente tiene un campo 'grado'

//     // Filtra los alumnos por el grado del docente
//     const alumnos = await Alumnos.find({ Grado: gradoDocente });
//     res.json(alumnos); // Responde con los alumnos filtrados por grado
//   } catch (error) {
//     console.error("Error al obtener los alumnos:", error);
//     res.status(500).send("Error al obtener los alumnos");
//   }
// });

// Obtener todos los alumnos
router.get("/api/alumnos", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Alumnos");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los alumnos:", error);
    res.status(500).json({ message: "Error al obtener los alumnos" });
  }
});

module.exports = router;

// Agregar un comentario a un alumno
router.put("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;

  try {
    const pool = await getConnection();
    
    // Verificar si el alumno existe
    const alumno = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Alumnos WHERE id = @id");

    if (alumno.recordset.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Insertar el comentario en la tabla de comentarios
    await pool
      .request()
      .input("id_alumno", sql.Int, id)
      .input("comentario", sql.Text, comentario)
      .input("fecha", sql.DateTime, new Date())
      .query("INSERT INTO Comentarios (id_alumno, comentario, fecha) VALUES (@id_alumno, @comentario, @fecha)");

    res.status(200).json({ message: "Comentario agregado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el comentario:", error);
    res.status(500).json({ message: "Error al actualizar el comentario" });
  }
});


// Consultar comentarios de un alumno
router.get("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    
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


// app.post('/pago', async (req, res) => {


//   const { token, amount } = req.body;

//   try {
//     const charge = await stripe.charges.create({
//       amount: amount * 100, // Convertir el monto a centavos
//       currency: 'mxn', // Cambia la moneda si es necesario
//       description: 'Pago de colegiatura',
//       source: token, // Token obtenido desde el front-end
//     });

//     res.json({ success: true, charge });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// Obtener todos los pagos desde la colección 'pagos' directamente
// router.get("/pagos", async (req, res) => {
//   try {
//     const pagos = await mongoose.connection.db.collection("pagos").find().toArray(); // Acceso directo a la colección
//     res.json(pagos); // Enviar los datos como respuesta
//   } catch (error) {
//     console.error("Error al obtener los pagos:", error);
//     res.status(500).send("Error al obtener los pagos");
//   }
// });

// app.use("/api", router);

// app.use('/api', router);  


// 


// const Calificacion = mongoose.model("Calificacion", calificacionSchema);

// Ruta para recibir las calificaciones
router.post("/calificaciones", async (req, res) => {
  const { nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal } = req.body;

  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("nombreEstudiante", sql.VarChar(100), nombreEstudiante)
      .input("grado", sql.VarChar(50), grado)
      .input("grupo", sql.VarChar(50), grupo)
      .input("guia", sql.Float, guia)
      .input("examen", sql.Float, examen)
      .input("EAT", sql.Float, EAT)
      .input("AF", sql.Float, AF)
      .input("calificacionFinal", sql.Float, calificacionFinal)
      .query(
        `INSERT INTO Calificaciones (nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal) 
         VALUES (@nombreEstudiante, @grado, @grupo, @guia, @examen, @EAT, @AF, @calificacionFinal)`
      );

    res.status(201).json({ message: "Calificación guardada exitosamente." });
  } catch (error) {
    console.error("Error al guardar la calificación:", error);
    res.status(500).json({ message: "Error al guardar la calificación." });
  }
});

module.exports = router;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
