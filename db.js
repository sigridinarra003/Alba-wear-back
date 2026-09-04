const mysql = require('mysql2');

// Crear la conexión con XAMPP / MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Por defecto en XAMPP viene vacía
  database: 'albawear'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la Base de Datos:', err);
    return;
  }
  console.log('✅ Conectado exitosamente a la base de datos albawear');
});

module.exports = db;