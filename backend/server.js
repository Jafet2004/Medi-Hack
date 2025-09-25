const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Ajusta según tu frontend
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: 'Jy221104',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // ✅ false en desarrollo con HTTP
        maxAge: 24 * 60 * 60 * 1000 // 24h
    }
}));

// Configuración de la base de datos
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

// Ruta de login
app.post('/login', (req, res) => {
    const { rol, email, password } = req.body;
    console.log('Intento de login:', { rol, email });
    
    if (!rol || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const query = 'SELECT * FROM usuarios WHERE correo = ? AND tipo_usuario = ?';
    db.query(query, [email, rol], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const user = results[0];
        
        if (password !== user.contrasena) { // ⚠️ Usa bcrypt en producción
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        req.session.userId = user.id_usuario;
        req.session.userType = user.tipo_usuario;
        req.session.email = user.correo;
        
        res.json({ 
            message: 'Login exitoso', 
            user: {
                id: user.id_usuario,
                tipo: user.tipo_usuario,
                nombre: `${user.primer_nombre} ${user.primer_apellido}`
            }
        });
    });
});

// Verificar sesión
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            loggedIn: true, 
            user: {
                id: req.session.userId,
                tipo: req.session.userType,
                email: req.session.email
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
