const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Historial = require("../models/Historial");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios (solo admin)
const obtenerUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "No tienes permisos para ver esta información" });
    }

    const usuarios = await Usuario.find({}, "-password");
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    let usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (password && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(password)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    if (rol && req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "No tienes permisos para cambiar roles" });
    }

    if (email) {
      const emailLimpio = email.trim().toLowerCase();
      const emailExistente = await Usuario.findOne({ email: emailLimpio });
      if (emailExistente && emailExistente._id.toString() !== id) {
        return res.status(400).json({ mensaje: "El email ya está registrado" });
      }
      usuario.email = emailLimpio;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    usuario.nombre = nombre ? nombre.trim() : usuario.nombre;
    usuario.rol = rol || usuario.rol;

    await usuario.save();

    const { password: _, ...usuarioSinPassword } = usuario.toObject();
    res.json({ mensaje: "Usuario actualizado", usuario: usuarioSinPassword });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario", error: error.message });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioSolicitante = req.usuario;

    const usuarioAEliminar = await Usuario.findById(id);
    if (!usuarioAEliminar) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuarioSolicitante.rol !== "admin" && usuarioSolicitante.id !== id.toString()) {
      return res.status(403).json({ mensaje: "No puedes eliminar a otro usuario." });
    }

    const admins = await Usuario.countDocuments({ rol: "admin" });
    if (
      usuarioSolicitante.rol === "admin" &&
      usuarioSolicitante.id === id.toString() &&
      admins <= 1
    ) {
      return res.status(403).json({
        mensaje: "No puedes eliminarte sin antes transferir el rol a otro usuario.",
      });
    }

    await Historial.create({
      accion: "Eliminación de usuario",
      usuarioAfectado: new mongoose.Types.ObjectId(id),
      realizadoPor: new mongoose.Types.ObjectId(usuarioSolicitante.id),
      fecha: new Date(),
    });

    await Usuario.findByIdAndDelete(id);

    res.json({ mensaje: "Usuario eliminado correctamente y registrado en el historial." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};
