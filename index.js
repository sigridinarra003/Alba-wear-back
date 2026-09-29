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

// 3. Crear un nuevo producto (Solo Admin)
app.post('/api/productos', (req, res) => {
  const { nombre, precio, imagen, descripcion, id_categoria, es_destacado, rolUsuario } = req.body;

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  // Objeto con los datos exactos que van a la base de datos
  const nuevoProducto = {
    nombre: nombre,
    descripcion: descripcion || '',
    precio: precio,
    stock: 10,                            // Stock por defecto para satisfacer NOT NULL
    id_talle: 1,                          // Talle por defecto para satisfacer NOT NULL
    imagen: imagen || '/img/placeholder.jpg',
    id_categoria: id_categoria || 1,
    es_destacado: es_destacado ? 1 : 0    // Guardamos 1 si es destacado, 0 si no
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

// 4. Editar / Actualizar un producto existente (Solo Admin)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, descripcion, id_categoria, es_destacado, rolUsuario } = req.body;

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  const query = `
    UPDATE productos 
    SET nombre = ?, precio = ?, imagen = ?, descripcion = ?, id_categoria = ?, es_destacado = ?
    WHERE id_producto = ?
  `;

  const valores = [
    nombre,
    precio,
    imagen || '/img/placeholder.jpg',
    descripcion || '',
    id_categoria,
    es_destacado ? 1 : 0,
    id
  ];

  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('❌ Error al editar producto en MySQL:', err);
      return res.status(500).json({ error: 'Error al actualizar el producto en la base de datos' });
    }
    res.json({ mensaje: 'Producto actualizado con éxito' });
  });
});

// 5. Eliminar producto (Solo Admin)
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { rolUsuario } = req.body;

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. No tenés permisos.' });
  }

  const query = 'DELETE FROM productos WHERE id_producto = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
});

// ==========================================
// 📂 RUTAS DE CATEGORÍAS Y TALLES
// ==========================================

app.get('/api/categorias', (req, res) => {
  const query = 'SELECT * FROM categorias';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener categorías' });
    res.json(results);
  });
});

app.get('/api/talles', (req, res) => {
  const query = 'SELECT * FROM talle';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener talles' });
    res.json(results);
  });
});

// ==========================================
// 👤 RUTAS DE USUARIOS / LOGIN Y REGISTRO
// ==========================================

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

app.post('/api/usuarios/registro', (req, res) => {
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