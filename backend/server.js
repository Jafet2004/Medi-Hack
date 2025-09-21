const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: 'Jy221104',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // true para usar HTTPS
}));

// Configuración de la base de datos (usando pool)
const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Jy221104',
    database: 'medi_hack',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
    connection.release();
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor corriendo 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
