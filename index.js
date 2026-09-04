const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// 🛍️ RUTAS DE PRODUCTOS
// ==========================================

// 1. Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
});

// 2. Obtener un solo producto por ID
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos WHERE id_producto = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el producto' });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(results[0]);
  });
});

// 3. Crear un nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, id_talle, imagen, id_categoria } = req.body;
  const query = 'INSERT INTO productos (nombre, descripcion, precio, stock, id_talle, imagen, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, descripcion, precio, stock, id_talle, imagen, id_categoria], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear el producto' });
    res.status(201).json({ mensaje: 'Producto creado con éxito', id: result.insertId });
  });
});

// ==========================================
// 📂 RUTAS DE CATEGORÍAS Y TALLES
// ==========================================

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const query = 'SELECT * FROM categorias';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener categorías' });
    res.json(results);
  });
});

// Obtener todos los talles
app.get('/api/talles', (req, res) => {
  const query = 'SELECT * FROM talle';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener talles' });
    res.json(results);
  });
});

// ==========================================
// 👤 RUTAS DE USUARIOS / LOGIN
// ==========================================

// Login de usuario
app.post('/api/usuarios/login', (req, res) => {
  const { correo, contrasena } = req.body;
  
  console.log('Intento de login para:', correo);

  const query = 'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?';
  
  db.query(query, [correo, contrasena], (err, results) => {
    if (err) {
      console.error('❌ Error de MySQL en el Login:', err);
      return res.status(500).json({ error: `Error en la base de datos: ${err.sqlMessage}` });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    
    const usuario = results[0];
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres || usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  });
});

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
