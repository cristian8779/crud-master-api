const express = require('express');
const { crearCategoria, obtenerCategorias } = require('../controllers/categoriaController');
const { verificarToken } = require('../controllers/usuarioController');

const router = express.Router();

// Crear una nueva categoría (solo admins)
router.post('/', verificarToken, crearCategoria);

// Obtener todas las categorías (todos los usuarios)
router.get('/', obtenerCategorias);

module.exports = router;
