const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Resend } = require("resend");
const generarPlantillaResetPassword = require("../utils/generarPlantillaResetPassword");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Enviar correo con token para resetear contraseña
const enviarResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que se proporcione un email
    if (!email) {
      return res.status(400).json({ mensaje: "El correo es obligatorio" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: "Correo electrónico inválido" });
    }

    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Correo no encontrado" });
    }

    // Generar token y expiración (10 minutos)
    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = Date.now() + 1000 * 60 * 10;

    // Eliminar cualquier token anterior por seguridad
    usuario.resetToken = undefined;
    usuario.resetTokenExpira = undefined;
    await usuario.save();

    // Guardar nuevo token
    usuario.resetToken = token;
    usuario.resetTokenExpira = expiracion;
    await usuario.save();

    // Generar URL con esquema deep link personalizado
const url = `crud://reset-password/${token}`;


    // Enviar correo con plantilla HTML
    await resend.emails.send({
      from: "soporte@soportee.store",
      to: [usuario.email],
      subject: "Restablecer contraseña",
      html: generarPlantillaResetPassword(usuario.nombre || "usuario", url),
    });

    res.json({ mensaje: "Correo de restablecimiento enviado" });
  } catch (error) {
    console.error("Error en enviarResetPassword:", error);
    res.status(500).json({ mensaje: "Error al enviar el correo", error: error.message });
  }
};

// Resetear contraseña con token
const resetearPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword) {
      return res.status(400).json({ mensaje: "La nueva contraseña es obligatoria" });
    }

    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpira: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Token inválido o expirado" });
    }

    // Validar contraseña segura
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
    if (!passwordRegex.test(nuevaPassword)) {
      return res.status(400).json({
        mensaje:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);

    // Eliminar token usado
    usuario.resetToken = undefined;
    usuario.resetTokenExpira = undefined;

    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en resetearPassword:", error);
    res.status(500).json({ mensaje: "Error al restablecer la contraseña", error: error.message });
  }
};

module.exports = {
  enviarResetPassword,
  resetearPassword,
};
