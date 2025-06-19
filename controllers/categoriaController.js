const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto'); // Verificar relaciones
const cloudinary = require('../config/cloudinary'); // Para manejar imágenes

// Crear una categoría (Solo Admin)
const crearCategoria = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para crear categorías' });
    }

    const { nombre, descripcion } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe una categoría con el mismo nombre
    const existe = await Categoria.findOne({ nombre });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
    }

    const imagenUrl = req.file?.path || null;

    const nuevaCategoria = new Categoria({
      nombre,
      descripcion,
      imagen: imagenUrl
    });

    await nuevaCategoria.save();

    res.status(201).json({
      mensaje: 'Categoría creada correctamente',
      categoria: nuevaCategoria
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
};

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json({ categorias });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
};

// Actualizar una categoría (incluye imagen)
const actualizarCategoria = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar categorías' });
    }

    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    // Si se subió una nueva imagen, eliminar la anterior en Cloudinary
    let nuevaImagen = categoria.imagen;
    if (req.file) {
      if (categoria.imagen) {
        const publicId = categoria.imagen.split('/').pop().split('.')[0]; // Obtener public_id
        await cloudinary.uploader.destroy(`productos/${publicId}`);
      }
      nuevaImagen = req.file.path;
    }

    categoria.nombre = nombre || categoria.nombre;
    categoria.descripcion = descripcion || categoria.descripcion;
    categoria.imagen = nuevaImagen;

    await categoria.save();

    res.json({ mensaje: 'Categoría actualizada correctamente', categoria });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error: error.message });
  }
};

// Eliminar una categoría (Solo Admin)
const eliminarCategoria = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar categorías' });
    }

    const { id } = req.params;

    // Verificar si está en uso
    const productosRelacionados = await Producto.find({ categoria: id });
    if (productosRelacionados.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar la categoría porque está en uso por productos'
      });
    }

    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    // Eliminar imagen de Cloudinary si existe
    if (categoria.imagen) {
      const publicId = categoria.imagen.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`productos/${publicId}`);
    }

    await Categoria.findByIdAndDelete(id);

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: error.message });
  }
};

module.exports = {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria
};
