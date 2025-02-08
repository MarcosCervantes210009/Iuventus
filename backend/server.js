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
const sql = require("mssql");
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
app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    // Conectar a la base de datos
    await sql.connect(config);

    // Consulta SQL para buscar el usuario
    const result = await sql.query`SELECT usuario, contraseña, role FROM Usuarios WHERE usuario = ${user}`;

    if (result.recordset.length === 0) {
      console.log(`Usuario no encontrado: ${user}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const foundUser = result.recordset[0];

    if (foundUser.password !== password) {
      console.log(`Contraseña incorrecta para el usuario: ${user}`);
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    console.log("Inicio de sesión exitoso:", foundUser);
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        user: foundUser.user,
        role: foundUser.role || null, // Verifica si el rol existe
      },
    });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    sql.close(); // Cierra la conexión después de la consulta
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
  const { user, password, termsAccepted, role, subjects } = req.body;

  console.log("Datos recibidos en el backend:", req.body);

  if (password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
  }

  if (!termsAccepted) {
    return res.status(400).json({ message: "Debes aceptar los términos y condiciones." });
  }

  if (role === "3" && (!subjects || subjects.length === 0)) {
    return res.status(400).json({ message: "El docente debe seleccionar al menos una materia." });
  }

  try {
    const pool = await getConnection();

    // Verificar si el usuario ya existe
    const userCheck = await pool
      .request()
      .input("user", sql.VarChar, user)
      .query("SELECT * FROM Usuarios WHERE user = @user");

    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe." });
    }

    // Insertar nuevo usuario
    await pool
      .request()
      .input("user", sql.VarChar, user)
      .input("password", sql.VarChar, password) // Hashea la contraseña en producción
      .input("role", sql.Int, role)
      .query("INSERT INTO Usuarios (user, password, role) VALUES (@user, @password, @role)");

    // Si el usuario es un docente, registrar sus materias
    if (role === "3") {
      for (let subject of subjects) {
        await pool
          .request()
          .input("user", sql.VarChar, user)
          .input("subject", sql.Int, subject)
          .query("INSERT INTO DocenteMaterias (user, subject) VALUES (@user, @subject)");
      }
    }

    res.status(201).json({ message: "Usuario creado exitosamente." });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});
module.exports = router;



app.get("/api/users", async (req, res) => {
    try {
      const users = await User.find();  // Obtener todos los usuarios de la base de datos
      res.status(200).json(users);  // Enviar los usuarios como respuesta
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      res.status(500).json({ message: "Error al obtener los usuarios" });
    }
  });
  // Ruta para eliminar usuario
app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;  // Obtener el id desde los parámetros de la URL
  
    try {
      const deletedUser = await User.findByIdAndDelete(id);  // Buscar y eliminar al usuario
  
      if (!deletedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  });

  // Ruta para actualizar la contraseña del usuario
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;  // Obtener la nueva contraseña desde el cuerpo de la solicitud
  
    try {
      // Buscar al usuario por su ID y actualizar la contraseña
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { password },  // Actualizar la contraseña
        { new: true }   // Devuelve el usuario actualizado
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.status(200).json({ message: "Contraseña actualizada exitosamente", user: updatedUser });
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
  });
  
 

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
app.get("/api/alumnos", async (req, res) => {
  try {
    const alumnos = await Alumnos.find(); // Obtiene todos los alumnos
    res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error al obtener los alumnos:", error);
    res.status(500).json({ message: "Error al obtener los alumnos" });
  }
});

// Agregar un comentario a un alumno
app.put("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params; // ID del alumno recibido en la URL
  const { comentario } = req.body; // Comentario recibido en el cuerpo de la solicitud

  try {
    // Asegúrate de que el ID sea un número
    const idNumerico = parseInt(id);
    if (isNaN(idNumerico)) {
      return res.status(400).json({ message: "ID no válido, debe ser un número" });
    }

    // Busca al alumno por su 'id' (numérico)
    const alumno = await Alumnos.findOne({ id: idNumerico });

    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Asegúrate de que el campo de comentarios esté inicializado
    alumno["Comentario TPersonal"] = alumno["Comentario TPersonal"] || []; 

    // Agrega el nuevo comentario con fecha
    alumno["Comentario TPersonal"].push({
      texto: comentario,
      fecha: new Date(),
    });

    // Guarda los cambios en la base de datos
    await alumno.save();

    res.status(200).json({
      message: "Comentario agregado exitosamente",
      alumno,
    });
  } catch (error) {
    console.error("Error al actualizar el comentario:", error);
    res.status(500).json({ message: "Error al actualizar el comentario" });
  }
});

// Consultar comentarios de un alumno
app.get("/api/alumnos/:id/comentarios", async (req, res) => {
  const { id } = req.params;

  try {
    // Asegúrate de que el ID sea un número
    const idNumerico = parseInt(id);
    if (isNaN(idNumerico)) {
      return res.status(400).json({ message: "ID no válido, debe ser un número" });
    }

    // Busca al alumno por su 'id' (numérico)
    const alumno = await Alumnos.findOne({ id: idNumerico });

    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Retorna solo los comentarios
    res.status(200).json({
      message: "Comentarios encontrados",
      comentarios: alumno["Comentario TPersonal"] || [],
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
app.post("/calificaciones", async (req, res) => {
  const { nombreEstudiante, grado, grupo, guia, examen, EAT, AF, calificacionFinal } = req.body;

  try {
    const nuevaCalificacion = new Calificacion({
      nombreEstudiante,
      grado,
      grupo,
      guia,
      examen,
      EAT,
      AF,
      calificacionFinal,
    });

    await nuevaCalificacion.save();
    res.status(201).json({ message: "Calificación guardada exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar la calificación." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
