const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Historial = require("../models/Historial"); // Nuevo modelo para el registro de eliminaciones
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Crear usuario con token JWT
const crearUsuario = async (req, res) => {
  try {
    let { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Validar formato de email
    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "Ingrese un correo válido" });
    }

    // Validar contraseña fuerte
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/; // Al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.",
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      email,
      password: passwordHash,
      rol: rol || "usuario", // Por defecto, "usuario"
    });

    await nuevoUsuario.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      mensaje: "Usuario creado",
      usuario: { nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      token,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

// Login de usuario
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

// Middleware para verificar token
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

// Obtener perfil del usuario autenticado
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

// Obtener todos los usuarios (Solo admins)
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

// Actualizar usuario con contraseña fuerte
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    let usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Validar contraseña fuerte si se va a actualizar
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/; // Al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número
    if (password && !passwordRegex.test(password)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.",
      });
    }

    // Solo admin puede cambiar roles, y no puede cambiar su propio rol
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
    res.json({ mensaje: "Usuario actualizado", usuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario", error: error.message });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioSolicitante = req.usuario; // Usuario autenticado (el que hace la petición)

    // Buscar usuario a eliminar
    const usuarioAEliminar = await Usuario.findById(id);
    if (!usuarioAEliminar) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Si el usuario autenticado no es admin, solo puede eliminarse a sí mismo
    if (usuarioSolicitante.rol !== "admin" && usuarioSolicitante.id.toString() !== id.toString()) {
      return res.status(403).json({ mensaje: "No puedes eliminar a otro usuario." });
    }

    // Evitar que un administrador elimine su propia cuenta si es el único admin
    const admins = await Usuario.countDocuments({ rol: "admin" });
    if (usuarioSolicitante.rol === "admin" && usuarioSolicitante.id.toString() === id.toString() && admins <= 1) {
      return res.status(403).json({
        mensaje: "No puedes eliminarte sin antes transferir el rol a otro usuario.",
      });
    }

    // Registrar en el historial con la persona correcta
    await Historial.create({
      accion: "Eliminación de usuario",
      usuarioAfectado: new mongoose.Types.ObjectId(id),
      realizadoPor: new mongoose.Types.ObjectId(usuarioSolicitante.id),
      fecha: new Date(),
    });

    // Eliminar usuario
    await Usuario.findByIdAndDelete(id);

    res.json({ mensaje: "Usuario eliminado correctamente y registrado en el historial." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
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
};
