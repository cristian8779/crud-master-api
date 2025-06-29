const esSuperAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "superadmin" && req.usuario?.rol !== "root") {
    return res.status(403).json({ mensaje: "Acceso denegado. Requiere rol superadmin." });
  }
  next();
};

module.exports = esSuperAdmin;