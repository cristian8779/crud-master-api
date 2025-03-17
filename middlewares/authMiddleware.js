const jwt = require('jsonwebtoken');

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No hay token.' });
  }

  // Extraer el token sin el prefijo "Bearer "
  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : tokenHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no válido.' });
  }
};

// Middleware para verificar el rol de admin
const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. No eres administrador.' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };
