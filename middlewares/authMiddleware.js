// Middleware para proteger rutas por rol (reemplaza las comprobaciones manuales de rolUsuario)
const verificarAdmin = (req, res, next) => {
  const rolUsuario = req.body?.rolUsuario || req.headers['x-user-role'];

  if (rolUsuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  next();
};

module.exports = { verificarAdmin };