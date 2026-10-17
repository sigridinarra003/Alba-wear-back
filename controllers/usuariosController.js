const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Login de Usuario (Compara con contraseña encriptada o texto plano)
exports.loginUsuario = (req, res) => {
  const { correo, contrasena } = req.body;
  console.log('Intento de login para:', correo);

  const query = 'SELECT * FROM usuarios WHERE correo = ?';
  
  db.query(query, [correo], async (err, results) => {
    if (err) {
      console.error('❌ Error de MySQL en el Login:', err);
      return res.status(500).json({ error: `Error en la base de datos: ${err.sqlMessage}` });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    
    const usuario = results[0];

    // Verificar si la clave coincide con bcrypt o si es texto plano antiguo
    let esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida && contrasena === usuario.contrasena) {
      esValida = true; // Permite ingresar usuarios creados antes del hasheo
    }

    if (!esValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

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
};

// Registro de Usuario con contraseña hasheada
exports.registrarUsuario = async (req, res) => {
  const { nombre, apellido, correo, contrasena } = req.body;
  const rol = 'usuario';

  try {
    // Hasheamos la contraseña antes de guardarla
    const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

    const query = 'INSERT INTO usuarios (nombres, apellidos, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [nombre, apellido, correo, contrasenaHasheada, rol], (err, result) => {
      if (err) {
        console.error('❌ Error al registrar usuario:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Este correo ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al guardar en la base de datos' });
      }
      
      res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al procesar la contraseña' });
  }
};