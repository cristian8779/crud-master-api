const Producto = require('../models/Producto');

// Crear un producto (Solo Admin)
const crearProducto = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para agregar productos' });
    }

    const { nombre, descripcion, precio } = req.body;
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const nuevoProducto = new Producto({ nombre, descripcion, precio });
    await nuevoProducto.save();

    res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
  } catch (error) {
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
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar productos' });
    }

    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    const producto = await Producto.findByIdAndUpdate(id, { nombre, descripcion, precio }, { new: true });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
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
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

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
