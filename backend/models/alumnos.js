const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema({
    id: { type: Number, required: true }, 
  Estudiante: { type: String, required: true },
  Grado: { type: String, required: true },
  Monto: { type: Number, default: 1000 },
  materias: { type: [Number], required: true },
  Comentarios: [
    {
      texto: { type: String },
      fecha: { type: Date, default: Date.now },
    },
  ],
});

const Alumnos = mongoose.model('alumnos', alumnoSchema); // Coincide con la colección en Atlas
module.exports = Alumnos;
