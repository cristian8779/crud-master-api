const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Por favor, ingrese un correo válido"]
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"]
  },
  direccion: {
    type: String,
    default: ""
  },
  telefono: {
    type: String,
    default: ""
  },
  imagenPerfil: {
    type: String,
    default: ""
  },
  cloudinaryId: {
    type: String,
    default: ""
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },

  // 👉 Campos para recuperación de contraseña
  resetToken: {
    type: String
  },
  resetTokenExpira: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
