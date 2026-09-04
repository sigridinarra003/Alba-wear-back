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
  const { nombre, precio, imagen, descripcion, id_categoria, rolUsuario } = req.body;

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  // Objeto con los datos exactos que van a la base de datos
  const nuevoProducto = {
    nombre: nombre,
    descripcion: descripcion || '',
    precio: precio,
    stock: 10,       // Stock por defecto para que no de error
    id_talle: 1,  // Por si tu tabla lo pide
    imagen: imagen || '/img/placeholder.jpg',
    id_categoria: id_categoria
  };

  const query = 'INSERT INTO productos SET ?';
  
  db.query(query, nuevoProducto, (err, result) => {
    if (err) {
      console.error('❌ Error al crear producto en MySQL:', err);
      return res.status(500).json({ error: 'Error al guardar el producto en la base de datos' });
    }
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


// ==========================================
// 🛠️ RUTAS DE ADMINISTRACIÓN DE PRODUCTOS
// ==========================================

// 1. CREAR PRODUCTO (Solo Admin)
app.post('/api/productos', (req, res) => {
  const { nombre, precio, imagen, descripcion, rolUsuario } = req.body;

  // Validación de seguridad en el backend
  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  const query = 'INSERT INTO productos (nombre, precio, imagen, descripcion) VALUES (?, ?, ?, ?)';
  
  db.query(query, [nombre, precio, imagen, descripcion], (err, result) => {
    if (err) {
      console.error('❌ Error al crear producto:', err);
      return res.status(500).json({ error: 'Error al guardar el producto en la base de datos' });
    }
    res.status(201).json({ mensaje: 'Producto creado con éxito', id: result.insertId });
  });
});

// 2. ELIMINAR PRODUCTO (Solo Admin)
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { rolUsuario } = req.body; // O lo podés validar por headers/query según prefieras

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. No tenés permisos.' });
  }

  const query = 'DELETE FROM productos WHERE id_producto = ?'; // Ajustá el nombre de la columna ID si es distinta

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
});




app.post('/api/usuarios/registro', (req, res) => {
  // Recibimos los datos que manda React
  const { nombre, apellido, correo, contrasena } = req.body;
  const rol = 'usuario'; 

  
  const query = 'INSERT INTO usuarios (nombres, apellidos, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, apellido, correo, contrasena, rol], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este correo ya está registrado' });
      }
      return res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
    
    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  });
});

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
