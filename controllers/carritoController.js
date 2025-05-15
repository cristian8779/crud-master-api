const Carrito = require('../models/Carrito');

const obtenerCarrito = async (req, res) => {
  try {
    // Intentar obtener el carrito del usuario
    const carrito = await Carrito.findOne({ usuarioId: req.user.id }).populate('productos.productoId');

    // Si no se encuentra el carrito, enviar un mensaje indicando que está vacío
    if (!carrito || carrito.productos.length === 0) {
      return res.status(404).json({ message: 'Carrito vacío' });
    }

    // Si se encuentra el carrito, se envía la respuesta con los productos
    res.json(carrito);
  } catch (err) {
    console.error('Error al obtener el carrito:', err);
    res.status(500).json({ message: 'Error en el servidor al obtener el carrito' });
  }
};

const agregarAlCarrito = async (req, res) => {
  const { productoId, talla, color, cantidad } = req.body;

  try {
    // Buscar el carrito del usuario
    let carrito = await Carrito.findOne({ usuarioId: req.user.id });

    // Si no existe un carrito, creamos uno nuevo
    if (!carrito) {
      carrito = new Carrito({ usuarioId: req.user.id, productos: [] });
    }

    // Verificamos si el producto ya existe en el carrito con la misma talla y color
    const index = carrito.productos.findIndex(p =>
      p.productoId.toString() === productoId && p.talla === talla && p.color === color
    );

    // Si el producto ya existe, actualizamos la cantidad
    if (index >= 0) {
      carrito.productos[index].cantidad += cantidad;
    } else {
      // Si no existe, lo agregamos al carrito
      carrito.productos.push({ productoId, talla, color, cantidad });
    }

    // Guardamos los cambios en el carrito
    await carrito.save();
    res.json(carrito);
  } catch (err) {
    console.error('Error al agregar al carrito:', err);
    res.status(500).json({ message: 'Error en el servidor al agregar al carrito' });
  }
};

const actualizarCantidad = async (req, res) => {
  const { productoId, talla, color, cantidad } = req.body;

  try {
    // Buscar el carrito del usuario
    const carrito = await Carrito.findOne({ usuarioId: req.user.id });

    // Si no se encuentra el carrito, retornamos un error
    if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Buscar el producto dentro del carrito
    const producto = carrito.productos.find(p =>
      p.productoId.toString() === productoId && p.talla === talla && p.color === color
    );

    // Si el producto no se encuentra en el carrito, retornamos un error
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado en el carrito' });

    // Actualizamos la cantidad del producto
    producto.cantidad = cantidad;

    // Guardamos los cambios en el carrito
    await carrito.save();
    res.json(carrito);
  } catch (err) {
    console.error('Error al actualizar la cantidad:', err);
    res.status(500).json({ message: 'Error en el servidor al actualizar la cantidad' });
  }
};

const eliminarDelCarrito = async (req, res) => {
  const { productoId, talla, color } = req.body;

  try {
    // Buscar el carrito del usuario
    const carrito = await Carrito.findOne({ usuarioId: req.user.id });

    // Si no se encuentra el carrito, retornamos un error
    if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Filtramos el producto que se desea eliminar del carrito
    carrito.productos = carrito.productos.filter(p =>
      !(p.productoId.toString() === productoId && p.talla === talla && p.color === color)
    );

    // Guardamos los cambios en el carrito
    await carrito.save();
    res.json(carrito);
  } catch (err) {
    console.error('Error al eliminar del carrito:', err);
    res.status(500).json({ message: 'Error en el servidor al eliminar del carrito' });
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito
};
