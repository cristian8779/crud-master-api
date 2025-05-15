const express = require('express');
const { obtenerCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito } = require('../controllers/carritoController');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

// Asegúrate de que 'verificarToken' esté aplicado antes de los controladores
router.get('/carrito', verificarToken, obtenerCarrito); // Obtener carrito
router.post('/carrito', verificarToken, agregarAlCarrito); // Agregar al carrito
router.put('/carrito', verificarToken, actualizarCantidad); // Actualizar cantidad de producto en el carrito
router.delete('/carrito', verificarToken, eliminarDelCarrito); // Eliminar producto del carrito

module.exports = router;
