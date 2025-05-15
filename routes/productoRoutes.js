const express = require('express');
const { 
  crearProducto, 
  obtenerProductos, 
  actualizarProducto, 
  eliminarProducto 
} = require('../controllers/productoController');
const { verificarToken } = require('../controllers/usuarioController');
const upload = require('../middlewares/upload');

const router = express.Router();

// Subir imagen usando Cloudinary
router.post('/upload', verificarToken, upload.single('imagen'), (req, res) => {
  if (req.file) {
    return res.status(200).json({ mensaje: 'Imagen subida correctamente', url: req.file.path });
  } else {
    return res.status(400).json({ mensaje: 'No se ha subido ninguna imagen' });
  }
});

// Rutas para productos
router.post('/', verificarToken, upload.single('imagen'), crearProducto);  // Solo Admin
router.get('/', obtenerProductos);  // Público
router.put('/:id', verificarToken, upload.single('imagen'), actualizarProducto);  // Solo Admin
router.delete('/:id', verificarToken, eliminarProducto);  // Solo Admin

module.exports = router;
