const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Historial = require("../models/Historial");
const cloudinary = require("../config/cloudinary");
const generarPlantillaBienvenida = require("../utils/plantillaBienvenida"); // Ajusta si la ruta es diferente
const resend = require('../config/resend');

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const crearUsuario = async (req, res) => {
  try {
    let { nombre, email, password, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    email = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "Correo electrónico no válido" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.",
      });
    }

    // Verificar si ya existe el usuario
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      email,
      password: passwordHash,
      rol: rol || "usuario",
    });

    await nuevoUsuario.save();

    // Enviar correo de bienvenida
    await resend.emails.send({
      from: 'Soporte <soporte@soportee.store>', // Formato correcto si está verificado
      to: email, // No usar [usuario.email], solo email
      subject: '¡Registro exitoso!',
      html: generarPlantillaBienvenida(nombre.trim()),
    });

    // Crear token
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respuesta exitosa
    res.status(201).json({
      mensaje: "Usuario creado",
      usuario: { nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      token,
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

module.exports = { crearUsuario };


// Login
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios" });
    }

    const emailLimpio = email.trim().toLowerCase();
    const usuario = await Usuario.findOne({ email: emailLimpio });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: usuario.rol === "admin" ? "30d" : "1h" }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el login", error: error.message });
  }
};

// Verificar token
const verificarToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};

// Obtener perfil
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id, "-password");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil", error: error.message });
  }
};

// Obtener todos los usuarios
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
    if (usuarioSolicitante.rol === "admin" && usuarioSolicitante.id === id.toString() && admins <= 1) {
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

// Actualizar imagen de perfil
const actualizarImagenPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ mensaje: "No se proporcionó ninguna imagen válida" });
    }

    if (usuario.cloudinaryId) {
      await cloudinary.uploader.destroy(usuario.cloudinaryId);
    }

    usuario.imagenPerfil = req.file.path;
    usuario.cloudinaryId = req.file.filename;

    await usuario.save();

    res.json({
      mensaje: "Imagen de perfil actualizada correctamente",
      imagenUrl: usuario.imagenPerfil,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la imagen de perfil", error: error.message });
  }
};

// Eliminar imagen de perfil
const eliminarImagenPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario || !usuario.cloudinaryId) {
      return res.status(404).json({ error: "No hay imagen para eliminar" });
    }

    await cloudinary.uploader.destroy(usuario.cloudinaryId);

    usuario.imagenPerfil = "";
    usuario.cloudinaryId = "";
    await usuario.save();

    const { password, ...usuarioSinPassword } = usuario.toObject();

    res.json({ mensaje: "Imagen eliminada correctamente", usuario: usuarioSinPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la imagen de perfil" });
  }
};

module.exports = {
  crearUsuario,
  loginUsuario,
  verificarToken,
  obtenerPerfil,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  actualizarImagenPerfil,
  eliminarImagenPerfil,
};
