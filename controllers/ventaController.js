const Venta = require("../models/Venta");
const Producto = require("../models/Producto");

exports.crearVenta = async (req, res) => {
  try {
    const { productos, total } = req.body;
    const usuarioId = req.usuario.id; // desde el token JWT

    // Descontar stock
    for (const item of productos) {
      const producto = await Producto.findById(item.productoId);
      const variacion = producto.variaciones.find(v =>
        v.talla === item.talla && v.color === item.color
      );

      if (!variacion || variacion.stock < item.cantidad) {
        return res.status(400).json({ mensaje: "Stock insuficiente para un producto" });
      }

      variacion.stock -= item.cantidad;
      await producto.save();
    }

    const nuevaVenta = new Venta({
      usuarioId,
      productos,
      total,
    });

    await nuevaVenta.save();

    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la venta", error });
  }
};

exports.obtenerVentasUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ventas = await Venta.find({ usuarioId }).populate("productos.productoId", "nombre");
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener ventas del usuario", error });
  }
};

exports.obtenerTodasLasVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate("usuarioId", "nombre email").populate("productos.productoId", "nombre");
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener ventas", error });
  }
};

exports.actualizarEstadoVenta = async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    const venta = await Venta.findByIdAndUpdate(id, { estado }, { new: true });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar estado", error });
  }
};
