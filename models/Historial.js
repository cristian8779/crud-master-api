const mongoose = require("mongoose");

const historialSchema = new mongoose.Schema({
  accion: { type: String, required: true },
  usuarioAfectado: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  realizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: false }, // Ahora es opcional
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Historial", historialSchema);
