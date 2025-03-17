const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Crear un usuario con token JWT
const crearUsuario = async (req, res) => {
  try {
    let { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    email = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "Ingrese un correo válido" });
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
      rol
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
      usuario: nuevoUsuario,
      token  
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

// Login y generación de token JWT
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
      { expiresIn: usuario.rol === "admin" ? '30d' : '1h' }
    );

    res.json({ 
      mensaje: "Login exitoso", 
      token,
      rol: usuario.rol
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

// Obtener todos los usuarios (Usuarios y Admin pueden ver la lista, solo Admin puede modificar)
const obtenerUsuarios = async (req, res) => {
  try {
    // Todos los usuarios pueden ver la lista de usuarios
    const usuarios = await Usuario.find({}, '-password');
    
    // Devuelve todos los usuarios sin filtrar
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

    // Solo los administradores pueden actualizar otros usuarios
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "No tienes permisos para actualizar usuarios" });
    }

    if (email) {
      const emailLimpio = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailLimpio)) {
        return res.status(400).json({ mensaje: "Ingrese un correo válido" });
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

    // Solo los administradores pueden eliminar usuarios
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "No tienes permisos para eliminar usuarios" });
    }

    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
  }
};

module.exports = { 
  crearUsuario, 
  loginUsuario, 
  verificarToken,
  obtenerUsuarios, 
  actualizarUsuario, 
  eliminarUsuario 
};
