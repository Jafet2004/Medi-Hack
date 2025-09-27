// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
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
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
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

        if (password !== user.contrasena) {
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

// =========================
// Obtener datos del paciente por ID - RUTA CORREGIDA
// =========================
app.get('/api/paciente/:id', (req, res) => {
    const patientId = req.params.id;
    console.log('Solicitud de datos para paciente ID:', patientId);

    if (!req.session.userId) {
        console.log('No autorizado - sin sesión');
        console.log('Patient ID solicitado:', patientId);
        console.log('Session userId:', req.session.userId);
        console.log('Session userType:', req.session.userType);
        return res.status(401).json({ message: 'No autorizado' });
    }

    const query = `
        SELECT u.*, p.* 
        FROM usuarios u 
        INNER JOIN pacientes p ON u.id_usuario = p.id_paciente 
        WHERE u.id_usuario = ?
    `;

    db.query(query, [patientId], (err, results) => {
        if (err) {
            console.error('Error obteniendo datos del paciente:', err);
            return res.status(500).json({ message: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        res.json(results[0]);
    });
});

// =========================
// Registro de Pacientes
// =========================
app.post('/register/paciente', (req, res) => {
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, email, contrasena, codigo_paciente, fecha_nacimiento, celular, direccion, genero } = req.body;

    if (!primer_nombre || !primer_apellido || !cedula || !email || !contrasena || !codigo_paciente || !fecha_nacimiento) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser llenados' });
    }

    const queryUsuario = `
        INSERT INTO usuarios (tipo_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena)
        VALUES ('paciente', ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryUsuario, [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, email, contrasena], (err, result) => {
        if (err) {
            console.error('Error insertando usuario:', err);
            return res.status(500).json({ message: 'Error al registrar usuario' });
        }

        const idUsuario = result.insertId;

        const queryPaciente = `
            INSERT INTO pacientes (id_paciente, cod_pac, fecha_nacimiento, celular, direccion, genero) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(queryPaciente, [idUsuario, codigo_paciente, fecha_nacimiento, celular, direccion, genero], (err2) => {
            if (err2) {
                console.error('Error insertando paciente:', err2);
                return res.status(500).json({ message: 'Error al registrar paciente' });
            }

            res.json({ message: 'Paciente registrado con éxito', id: idUsuario });
        });
    });
});

// =========================
// Registro de Trabajadores
// =========================
app.post('/register_trab', (req, res) => {
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena, codigo_minsa } = req.body;

    if (!primer_nombre || !primer_apellido || !cedula || !correo || !contrasena || !codigo_minsa) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser llenados' });
    }

    const queryUsuario = `
        INSERT INTO usuarios (tipo_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena)
        VALUES ('trabajador', ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(queryUsuario, [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena], (err, result) => {
        if (err) {
            console.error('Error insertando usuario:', err);
            return res.status(500).json({ message: 'Error al registrar usuario' });
        }

        const idUsuario = result.insertId;

        const queryTrabajador = `INSERT INTO trabajadores_salud (id_trabajador, codigo_minsa) VALUES (?, ?)`;
        db.query(queryTrabajador, [idUsuario, codigo_minsa], (err2) => {
            if (err2) {
                console.error('Error insertando trabajador:', err2);
                return res.status(500).json({ message: 'Error al registrar trabajador' });
            }

            res.json({ message: 'Trabajador registrado con éxito', id: idUsuario });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});