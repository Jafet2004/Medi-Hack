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
// Obtener datos del paciente por ID
// =========================
app.get("/api/paciente/:id", (req, res) => {
    const patientId = req.params.id;
    console.log("Solicitud de datos para paciente ID:", patientId);



    const query = `
    SELECT u.id_usuario, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
           u.cedula, u.correo, 
           p.cod_pac as Código, p.fecha_nacimiento, p.celular, p.direccion, p.genero,
           p.ocupacion, p.estado_civil
    FROM usuarios u 
    INNER JOIN pacientes p ON u.id_usuario = p.id_paciente 
    WHERE u.id_usuario = ?
`;


    db.query(query, [patientId], (err, results) => {
        if (err) {
            console.error("Error obteniendo datos del paciente:", err);
            return res.status(500).json({ message: "Error del servidor" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Paciente no encontrado" });
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
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena, codigo_minsa, especialidad } = req.body;

    if (!primer_nombre || !primer_apellido || !cedula || !correo || !contrasena || !codigo_minsa || !especialidad) {
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

        const queryTrabajador = `INSERT INTO trabajadores_salud (id_trabajador, codigo_minsa, especialidad) VALUES (?, ?, ?)`;
        db.query(queryTrabajador, [idUsuario, codigo_minsa], (err2) => {
            if (err2) {
                console.error('Error insertando trabajador:', err2);
                return res.status(500).json({ message: 'Error al registrar trabajador' });
            }

            res.json({ message: 'Trabajador registrado con éxito', id: idUsuario });
        });
    });
});

// Obtener historial completo de un paciente
app.get("/api/historial-completo/:idPaciente", (req, res) => {
    const { idPaciente } = req.params;

    const queryHistorial = `
        SELECT hc.* FROM historial_clinico hc 
        WHERE hc.id_paciente = ?
    `;

    db.query(queryHistorial, [idPaciente], (err, resultadosHistorial) => {
        if (err) {
            console.error("Error obteniendo historial:", err);
            return res.status(500).json({ error: "Error en el servidor" });
        }

        if (resultadosHistorial.length === 0) {
            return res.json({ tieneHistorial: false });
        }

        const idHistorial = resultadosHistorial[0].id_historial;

        // Obtener enfermedades crónicas
        const queryEnfermedades = `SELECT enfermedad FROM historial_enfermedades_cronicas WHERE id_historial = ?`;
        const queryAlergias = `SELECT alergia FROM historial_alergias WHERE id_historial = ?`;
        const queryCirugias = `SELECT tipo_cirugia, fecha_cirugia FROM historial_cirugias WHERE id_historial = ?`;
        const queryHospitalizaciones = `SELECT motivo, fecha FROM historial_hospitalizaciones WHERE id_historial = ?`;
        const queryMedicamentos = `SELECT nombre_medicamento, dosis, frecuencia FROM historial_medicamentos WHERE id_historial = ?`;

        Promise.all([
            queryAsync(db, queryEnfermedades, [idHistorial]),
            queryAsync(db, queryAlergias, [idHistorial]),
            queryAsync(db, queryCirugias, [idHistorial]),
            queryAsync(db, queryHospitalizaciones, [idHistorial]),
            queryAsync(db, queryMedicamentos, [idHistorial])
        ]).then(([enfermedades, alergias, cirugias, hospitalizaciones, medicamentos]) => {
            res.json({
                tieneHistorial: true,
                historial: {
                    ...resultadosHistorial[0],
                    enfermedades_cronicas: enfermedades,
                    alergias: alergias,
                    cirugias: cirugias,
                    hospitalizaciones: hospitalizaciones,
                    medicamentos: medicamentos
                }
            });
        }).catch(error => {
            console.error("Error obteniendo datos del historial:", error);
            res.status(500).json({ error: "Error obteniendo datos del historial" });
        });
    });
});

// Crear historial completo
app.post("/api/historial-completo", (req, res) => {
    const {
        idPaciente,
        tipo_sangre,
        antecedentes_familiares,
        enfermedadesCronicas,
        alergias,
        cirugias,
        hospitalizaciones,
        medicamentos
    } = req.body;

    const connection = mysql.createConnection(db.config);

    connection.beginTransaction(err => {
        if (err) {
            console.error("Error iniciando transacción:", err);
            return res.status(500).json({ error: "Error del servidor" });
        }

        // Insertar historial principal
        const queryHistorial = `
            INSERT INTO historial_clinico (id_paciente, tipo_sangre, antecedentes_familiares)
            VALUES (?, ?, ?)
        `;

        connection.query(queryHistorial, [idPaciente, tipo_sangre, antecedentes_familiares], (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    console.error("Error insertando historial:", err);
                    res.status(500).json({ error: "No se pudo crear el historial" });
                });
            }

            const idHistorial = result.insertId;

            // Insertar enfermedades crónicas
            if (enfermedadesCronicas && enfermedadesCronicas.length > 0) {
                const queryEnfermedades = `INSERT INTO historial_enfermedades_cronicas (id_historial, enfermedad) VALUES ?`;
                const valoresEnfermedades = enfermedadesCronicas.map(enfermedad => [idHistorial, enfermedad]);
                
                connection.query(queryEnfermedades, [valoresEnfermedades], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error insertando enfermedades:", err);
                            res.status(500).json({ error: "Error insertando enfermedades" });
                        });
                    }
                });
            }

            // Insertar alergias
            if (alergias && alergias.length > 0) {
                const queryAlergias = `INSERT INTO historial_alergias (id_historial, alergia) VALUES ?`;
                const valoresAlergias = alergias.map(alergia => [idHistorial, alergia]);
                
                connection.query(queryAlergias, [valoresAlergias], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error insertando alergias:", err);
                            res.status(500).json({ error: "Error insertando alergias" });
                        });
                    }
                });
            }

            // Insertar cirugías
            if (cirugias && cirugias.length > 0) {
                const queryCirugias = `INSERT INTO historial_cirugias (id_historial, tipo_cirugia, fecha_cirugia) VALUES ?`;
                const valoresCirugias = cirugias.map(cirugia => [idHistorial, cirugia.tipo_cirugia, cirugia.fecha_cirugia]);
                
                connection.query(queryCirugias, [valoresCirugias], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error insertando cirugías:", err);
                            res.status(500).json({ error: "Error insertando cirugías" });
                        });
                    }
                });
            }

            // Insertar hospitalizaciones
            if (hospitalizaciones && hospitalizaciones.length > 0) {
                const queryHospitalizaciones = `INSERT INTO historial_hospitalizaciones (id_historial, motivo, fecha) VALUES ?`;
                const valoresHospitalizaciones = hospitalizaciones.map(hosp => [idHistorial, hosp.motivo, hosp.fecha]);
                
                connection.query(queryHospitalizaciones, [valoresHospitalizaciones], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error insertando hospitalizaciones:", err);
                            res.status(500).json({ error: "Error insertando hospitalizaciones" });
                        });
                    }
                });
            }

            // Insertar medicamentos
            if (medicamentos && medicamentos.length > 0) {
                const queryMedicamentos = `INSERT INTO historial_medicamentos (id_historial, nombre_medicamento, dosis, frecuencia) VALUES ?`;
                const valoresMedicamentos = medicamentos.map(med => [idHistorial, med.nombre_medicamento, med.dosis, med.frecuencia]);
                
                connection.query(queryMedicamentos, [valoresMedicamentos], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Error insertando medicamentos:", err);
                            res.status(500).json({ error: "Error insertando medicamentos" });
                        });
                    }
                });
            }

            // Commit de la transacción
            connection.commit(err => {
                if (err) {
                    return connection.rollback(() => {
                        console.error("Error en commit:", err);
                        res.status(500).json({ error: "Error guardando historial" });
                    });
                }

                res.json({ 
                    message: "Historial clínico creado con éxito", 
                    idHistorial: idHistorial 
                });
            });
        });
    });
});

// Función auxiliar para promises
function queryAsync(db, sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// Buscar pacientes por nombre, cédula o ID
app.get('/api/buscar-pacientes', (req, res) => {
    const q = req.query.q;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: "Ingrese al menos 2 caracteres para buscar" });
    }

    const query = `
        SELECT u.id_usuario, u.primer_nombre, u.segundo_nombre, 
               u.primer_apellido, u.segundo_apellido, u.cedula, p.cod_pac as Código
        FROM usuarios u
        INNER JOIN pacientes p ON u.id_usuario = p.id_paciente
        WHERE u.tipo_usuario = 'paciente'
          AND (u.primer_nombre LIKE ? OR u.segundo_nombre LIKE ? 
          OR u.primer_apellido LIKE ? OR u.segundo_apellido LIKE ? 
          OR u.cedula LIKE ? OR u.id_usuario LIKE ?)
        
    `;

    const likeQuery = `%${q}%`;
    db.query(query, [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery], (err, results) => {
        if (err) {
            console.error("Error en búsqueda de pacientes:", err);
            return res.status(500).json({ message: "Error del servidor" });
        }
        res.json(results);
    });
});

// Obtener información del trabajador por ID
app.get("/api/trabajador/:id", (req, res) => {
    const trabajadorId = req.params.id;
    console.log("Solicitud de datos para trabajador ID:", trabajadorId);

    const query = `
        SELECT 
            u.id_usuario, 
            u.primer_nombre, 
            u.segundo_nombre, 
            u.primer_apellido, 
            u.segundo_apellido,
            u.cedula, 
            u.correo, 
            t.codigo_minsa, 
            t.especialidad
        FROM usuarios u 
        INNER JOIN trabajadores_salud t 
            ON u.id_usuario = t.id_usuario   -- 🔹 CORREGIDO: debe empatar con id_usuario
        WHERE u.id_usuario = ?
    `;

    db.query(query, [trabajadorId], (err, results) => {
        if (err) {
            console.error("Error obteniendo datos del trabajador:", err);
            return res.status(500).json({ message: "Error del servidor" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        res.json(results[0]);
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});