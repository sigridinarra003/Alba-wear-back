require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montar Enrutadores con sus prefijos
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});