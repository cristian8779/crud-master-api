const express = require('express');
const { 
  crearUsuario, 
  loginUsuario, 
  obtenerUsuarios, 
  actualizarUsuario, 
  eliminarUsuario 
} = require('../controllers/usuarioController');

const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Login
router.post('/login', loginUsuario);

// Obtener todos los usuarios (Usuarios y Admin pueden ver la lista, solo Admin puede modificar)
router.get('/usuarios', verificarToken, obtenerUsuarios);


// Crear usuario
router.post('/usuarios', crearUsuario);

// Actualizar usuario (solo admin)
router.put('/usuarios/:id', verificarToken, verificarAdmin, actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/usuarios/:id', verificarToken, verificarAdmin, eliminarUsuario);

module.exports = router;
