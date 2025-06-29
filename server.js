require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// 📦 Importar rutas
const authRoutes = require('./routes/authRoutes');             // Registro y login
const usuarioRoutes = require('./routes/usuarioRoutes');       // Gestión admin de usuarios
const perfilRoutes = require('./routes/perfilRoutes');         // Perfil de usuario autenticado
const resetPasswordRoutes = require('./routes/resetPasswordRoutes'); // Restablecer contraseña
const productoRoutes = require('./routes/productoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const resenaRoutes = require('./routes/resenas');              // Reseñas de productos
const historialRoutes = require('./routes/historial');        // Historial de productos vistos
const loginRoutes = require('./routes/login.Routes');        // Login con Google

// 🛡️ Middlewares
app.use(express.json());
app.use(cors());

// 🗂️ Servir archivos estáticos (por ejemplo, imágenes o frontend)
app.use(express.static(path.join(__dirname, 'public')));

// 🔌 Montar rutas con prefijo /api
app.use('/api', authRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', perfilRoutes);
app.use('/api', resetPasswordRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api/historial', require('./routes/historial')); // Historial de productos vistos
app.use('/api', loginRoutes); // Login con Google
// Ruta base
app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// 🧠 Conectar a base de datos y lanzar servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
