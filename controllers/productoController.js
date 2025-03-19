const Producto = require('../models/Producto');
const cloudinary = require('../config/cloudinary');

// Crear un producto (Solo Admin)
const crearProducto = async (req, res) => {
  try {
    console.log("Archivo recibido:", req.file); // Depuración

    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para agregar productos' });
    }

    const { nombre, descripcion, precio } = req.body;
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: 'Debes subir una imagen' });
    }

    // Cloudinary ya devuelve la URL de la imagen
    const imagenUrl = req.file.path;

    const nuevoProducto = new Producto({ nombre, descripcion, precio, imagen: imagenUrl });
    await nuevoProducto.save();

    res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
  } catch (error) {
    console.error("Error en crearProducto:", error);
    res.status(500).json({ mensaje: 'Error al agregar producto', error: error.message });
  }
};

// Obtener todos los productos (Disponible para todos)
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json({ productos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// Actualizar un producto (Solo Admin)
const actualizarProducto = async (req, res) => {
  try {
    console.log("Archivo recibido para actualización:", req.file);

    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar productos' });
    }

    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    let producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    let imagenUrl = producto.imagen;

    // Si se sube una nueva imagen, reemplazar la anterior
    if (req.file) {
      try {
        // Eliminar la imagen antigua de Cloudinary si existe
        if (producto.imagen) {
          const publicId = producto.imagen.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`productos/${publicId}`);
        }

        // Usar la nueva imagen de Cloudinary
        imagenUrl = req.file.path;
      } catch (error) {
        return res.status(500).json({ mensaje: 'Error al actualizar la imagen en Cloudinary', error: error.message });
      }
    }

    producto = await Producto.findByIdAndUpdate(
      id,
      { nombre, descripcion, precio, imagen: imagenUrl },
      { new: true }
    );

    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    console.error("Error en actualizarProducto:", error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

// Eliminar un producto (Solo Admin)
const eliminarProducto = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar productos' });
    }

    const { id } = req.params;
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Eliminar la imagen de Cloudinary antes de eliminar el producto
    if (producto.imagen) {
      const publicId = producto.imagen.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`productos/${publicId}`);
    }

    await Producto.findByIdAndDelete(id);

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
};
