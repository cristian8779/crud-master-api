const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const cloudinary = require('../config/cloudinary');

// Crear un producto (Solo Admin)
const crearProducto = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para agregar productos' });
    }

    const { nombre, descripcion, precio, categoria, variaciones, stock, disponible } = req.body;

    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    // Validar categoría
    const categoriaExistente = await Categoria.findById(categoria);
    if (!categoriaExistente) {
      return res.status(400).json({ mensaje: 'Categoría no válida' });
    }

    // Si no hay variaciones, se verifica el stock y disponible del producto base
    let variacionesParseadas = [];
    if (variaciones) {
      variacionesParseadas = JSON.parse(variaciones);
      if (!Array.isArray(variacionesParseadas) || variacionesParseadas.length === 0) {
        return res.status(400).json({ mensaje: 'Debe haber al menos una variación' });
      }
    }

    let imagenUrl = '', publicId = '';
    if (req.file) {
      const subida = await cloudinary.uploader.upload(req.file.path, { folder: 'productos' });
      imagenUrl = subida.secure_url;
      publicId = subida.public_id;
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      categoria,
      variaciones: variacionesParseadas,
      stock: stock || 0, // Si no hay variaciones, el stock se toma del producto base
      disponible: disponible !== undefined ? disponible : true, // Si no se especifica, se asume disponible
      imagen: imagenUrl,
      public_id: publicId
    });

    await nuevoProducto.save();

    res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
  } catch (error) {
    console.error("Error en crearProducto:", error);
    res.status(500).json({ mensaje: 'Error al agregar producto', error: error.message });
  }
};

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria', 'nombre');
    res.json({ productos });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar productos' });
    }

    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, variaciones, stock, disponible } = req.body;

    let producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    let actualizaciones = { nombre, descripcion, precio, categoria, stock, disponible };

    // Si se proporcionan variaciones, se validan y se asignan
    if (variaciones) {
      const variacionesParseadas = JSON.parse(variaciones);
      if (!Array.isArray(variacionesParseadas) || variacionesParseadas.length === 0) {
        return res.status(400).json({ mensaje: 'Debe haber al menos una variación' });
      }
      actualizaciones.variaciones = variacionesParseadas;
    }

    // Si se sube una nueva imagen
    if (req.file) {
      if (producto.public_id) {
        // Eliminar imagen anterior de Cloudinary
        await cloudinary.uploader.destroy(producto.public_id);
      }

      const subida = await cloudinary.uploader.upload(req.file.path, { folder: 'productos' });
      actualizaciones.imagen = subida.secure_url;
      actualizaciones.public_id = subida.public_id;
    }

    producto = await Producto.findByIdAndUpdate(id, actualizaciones, { new: true });

    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    console.error("Error en actualizarProducto:", error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

// Eliminar un producto
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

    if (producto.public_id) {
      // Eliminar imagen de Cloudinary
      await cloudinary.uploader.destroy(producto.public_id);
    }

    await Producto.findByIdAndDelete(id);

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error("Error en eliminarProducto:", error);
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

// Cambiar estado del producto (activar/desactivar)
const cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['activo', 'descontinuado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const producto = await Producto.findByIdAndUpdate(id, { estado }, { new: true });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Estado actualizado', producto });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ mensaje: 'Error al cambiar estado del producto', error: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto,
  cambiarEstadoProducto
};
