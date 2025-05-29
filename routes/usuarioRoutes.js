const express = require('express');

const {
  crearUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  obtenerPerfil,
  actualizarImagenPerfil,
  eliminarImagenPerfil
} = require('../controllers/usuarioController');

const {
  enviarResetPassword,
  resetearPassword
} = require('../controllers/resetPasswordController');

const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');
const uploadUsuario = require('../middlewares/uploadUsuario'); // Multer configurado para usuarios

const router = express.Router();

// Crear usuario
router.post('/usuarios', crearUsuario);

// Login
router.post('/login', loginUsuario);

// Obtener todos los usuarios (solo admin)
router.get('/usuarios', verificarToken, verificarAdmin, obtenerUsuarios);

// Actualizar usuario (solo admin)
router.put('/usuarios/:id', verificarToken, verificarAdmin, actualizarUsuario);

// Eliminar usuario (solo admin o el propio usuario)
router.delete('/usuarios/:id', verificarToken, eliminarUsuario);

// Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, obtenerPerfil);

// Actualizar imagen de perfil
router.put('/perfil/imagen', verificarToken, uploadUsuario.single('imagen'), actualizarImagenPerfil);

// Eliminar imagen de perfil
router.delete('/perfil/imagen', verificarToken, eliminarImagenPerfil);

// ----------------------
// Recuperación de contraseña
// ----------------------

// Solicitar token para restablecer contraseña
router.post('/forgot-password', enviarResetPassword);

// Restablecer contraseña con token
router.post('/reset-password/:token', resetearPassword);

module.exports = router;
