const express = require('express');
const { 
  crearProducto, 
  obtenerProductos, 
  actualizarProducto, 
  eliminarProducto 
} = require('../controllers/productoController'); 
const { verificarToken } = require('../controllers/usuarioController');
const upload = require('../middlewares/upload'); // Importar multer para Cloudinary

const router = express.Router();

// Rutas
router.post('/', verificarToken, upload.single('imagen'), crearProducto); // Solo Admin
router.get('/', obtenerProductos); // Todos los usuarios
router.put('/:id', verificarToken, upload.single('imagen'), actualizarProducto); // Solo Admin
router.delete('/:id', verificarToken, eliminarProducto); // Solo Admin

module.exports = router;
