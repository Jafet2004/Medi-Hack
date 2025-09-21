-- Crear base de datos
CREATE DATABASE medi_hack;
USE medi_hack;

-- =========================
-- Tabla de Usuarios (General)
-- =========================
-- Esta tabla maneja pacientes, trabajadores y administración.
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    tipo_usuario ENUM('paciente', 'trabajador', 'administracion') NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tabla Pacientes
-- =========================
CREATE TABLE pacientes (
    id_paciente INT PRIMARY KEY, -- mismo id que usuario
    fecha_nacimiento DATE NOT NULL,
    celular VARCHAR(15),
    direccion VARCHAR(255),
    genero ENUM('M','F','Otro'),
    ocupacion VARCHAR(100),
    estado_civil ENUM('Soltero','Casado','Divorciado','Viudo','Union Libre','Otro'),
    foto LONGBLOB,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================
-- Tabla Trabajadores de la Salud
-- =========================
CREATE TABLE trabajadores_salud (
    id_trabajador INT PRIMARY KEY, -- mismo id que usuario
    codigo_minsa VARCHAR(20) UNIQUE NOT NULL,
    CONSTRAINT fk_trabajador_usuario FOREIGN KEY (id_trabajador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================
-- Tabla Especialidades
-- =========================
CREATE TABLE especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_especialidad VARCHAR(100) UNIQUE NOT NULL
);

-- =========================
-- Relación Muchos a Muchos entre Trabajadores y Especialidades
-- =========================
CREATE TABLE trabajador_especialidad (
    id_trabajador INT,
    id_especialidad INT,
    PRIMARY KEY (id_trabajador, id_especialidad),
    CONSTRAINT fk_te_trabajador FOREIGN KEY (id_trabajador) REFERENCES trabajadores_salud(id_trabajador) ON DELETE CASCADE,
    CONSTRAINT fk_te_especialidad FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE CASCADE
);

-- =========================
-- Tabla Administración (Opcional)
-- =========================
-- Si quieres guardar datos extra de admins.
CREATE TABLE administradores (
    id_admin INT PRIMARY KEY, -- mismo id que usuario
    rol VARCHAR(50) DEFAULT 'Administrador',
    CONSTRAINT fk_admin_usuario FOREIGN KEY (id_admin) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);