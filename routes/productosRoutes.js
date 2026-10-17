const express = require('express');
const router = express.Router();
const productosController = require('../controllers/prductosController');
const { verificarAdmin } = require('../middlewares/authMiddleware');

// Rutas Públicas de Productos
router.get('/', productosController.obtenerProductos);
router.get('/categorias', productosController.obtenerCategorias);
router.get('/talles', productosController.obtenerTalles);
router.get('/:id', productosController.obtenerProductoPorId);

// Rutas Protegidas (Solo Admin)
router.post('/', verificarAdmin, productosController.crearProducto);
router.put('/:id', verificarAdmin, productosController.editarProducto);
router.delete('/:id', verificarAdmin, productosController.eliminarProducto);

module.exports = router;