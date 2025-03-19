const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  imagen: { type: String } // Nuevo campo para almacenar la URL de la imagen
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);
