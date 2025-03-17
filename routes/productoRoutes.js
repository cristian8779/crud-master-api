const express = require('express');
const { 
  crearProducto, 
  obtenerProductos, 
  actualizarProducto, 
  eliminarProducto 
} = require('../controllers/productoController'); 
const { verificarToken } = require('../controllers/usuarioController');

const router = express.Router();

// Rutas
router.post('/', verificarToken, crearProducto); // Solo Admin
router.get('/', obtenerProductos); // Todos los usuarios
router.put('/:id', verificarToken, actualizarProducto); // Solo Admin
router.delete('/:id', verificarToken, eliminarProducto); // Solo Admin

module.exports = router;
