
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["1", "2", "3"] },
  subjects: { type: [Number], default: [] }, // 1: Admin, 2: Director, 3: Docente
});

const User = mongoose.model("User", userSchema);

module.exports = User;

