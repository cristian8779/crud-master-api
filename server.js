require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const paymentRoutes = require('./routes/payment.routes');
const favoritoRoutes = require('./routes/favoritoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favoritos', favoritoRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// Conectar a MongoDB y luego iniciar el servidor
const startServer = async () => {
  try {
    await connectDB(); // Conectar a MongoDB usando la nueva configuración
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
