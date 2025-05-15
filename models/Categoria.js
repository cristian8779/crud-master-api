const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Categoria', CategoriaSchema);
