require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', usuarioRoutes);
app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// Conectar a MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ ERROR: No se encontró MONGO_URI en el archivo .env');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
