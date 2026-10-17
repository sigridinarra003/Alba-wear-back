const db = require('../config/db');

// 1. Obtener todos los productos
exports.obtenerProductos = (req, res) => {
  const query = 'SELECT * FROM productos';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
};

// 2. Obtener un solo producto por ID
exports.obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos WHERE id_producto = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el producto' });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(results[0]);
  });
};

// 3. Crear un nuevo producto
exports.crearProducto = (req, res) => {
  const { nombre, precio, imagen, descripcion, id_categoria, es_destacado } = req.body;

  const nuevoProducto = {
    nombre: nombre,
    descripcion: descripcion || '',
    precio: precio,
    stock: 10,
    id_talle: 1,
    imagen: imagen || '/img/placeholder.jpg',
    id_categoria: id_categoria || 1,
    es_destacado: es_destacado ? 1 : 0
  };

  const query = 'INSERT INTO productos SET ?';
  db.query(query, nuevoProducto, (err, result) => {
    if (err) {
      console.error('❌ Error al crear producto en MySQL:', err);
      return res.status(500).json({ error: 'Error al guardar el producto en la base de datos' });
    }
    res.status(201).json({ mensaje: 'Producto creado con éxito', id: result.insertId });
  });
};

// 4. Editar / Actualizar producto
exports.editarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, descripcion, id_categoria, es_destacado } = req.body;

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
};

// 5. Eliminar producto
exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id_producto = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
};

// 6. Obtener Categorías
exports.obtenerCategorias = (req, res) => {
  const query = 'SELECT * FROM categorias';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener categorías' });
    res.json(results);
  });
};

// 7. Obtener Talles
exports.obtenerTalles = (req, res) => {
  const query = 'SELECT * FROM talle';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener talles' });
    res.json(results);
  });
};