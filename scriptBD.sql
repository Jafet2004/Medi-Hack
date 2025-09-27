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
CREATE TABLE pacientes 
( 
	id_paciente INT PRIMARY KEY, -- mismo id que usuario 
    cod_pac VARCHAR(16) UNIQUE, 
    fecha_nacimiento DATE NOT NULL, 
    celular VARCHAR(15), 
    direccion VARCHAR(255), 
    genero ENUM('M','F','Otro'), 
    ocupacion VARCHAR(100), 
    estado_civil ENUM('Soltero','Casado','Divorciado','Viudo','Union Libre','Otro')
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

-- =========================
-- Tabla Historial Clínico
-- =========================
CREATE TABLE historial_clinico (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT UNIQUE NOT NULL, -- un historial único por paciente
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_sangre ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
    antecedentes_familiares TEXT,
    tabaquismo ENUM('nunca','exfumador','fumador'),
    alcohol ENUM('nunca','ocasional','moderado','frecuente'),
    actividad_fisica ENUM('sedentario','leve','moderado','intenso'),
    dieta ENUM('balanceada','vegetariana','vegana','altaEnGrasas','otra'),
    informacion_adicional TEXT,
    CONSTRAINT fk_historial_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE
);

-- =========================
-- Tabla Enfermedades Crónicas
-- =========================
CREATE TABLE historial_enfermedades_cronicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    enfermedad VARCHAR(100) NOT NULL,
    CONSTRAINT fk_ec_historial FOREIGN KEY (id_historial) REFERENCES historial_clinico(id_historial) ON DELETE CASCADE,
    UNIQUE (id_historial, enfermedad) -- evita duplicados
);

-- =========================
-- Tabla Alergias
-- =========================
CREATE TABLE historial_alergias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    alergia VARCHAR(100) NOT NULL,
    CONSTRAINT fk_al_historial FOREIGN KEY (id_historial) REFERENCES historial_clinico(id_historial) ON DELETE CASCADE,
    UNIQUE (id_historial, alergia)
);

-- =========================
-- Tabla Cirugías Previas
-- =========================
CREATE TABLE historial_cirugias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    tipo_cirugia VARCHAR(255) NOT NULL,
    fecha_cirugia DATE,
    CONSTRAINT fk_cirugia_historial FOREIGN KEY (id_historial) REFERENCES historial_clinico(id_historial) ON DELETE CASCADE,
    UNIQUE (id_historial, tipo_cirugia, fecha_cirugia)
);

-- =========================
-- Tabla Hospitalizaciones Previas
-- =========================
CREATE TABLE historial_hospitalizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    fecha DATE,
    CONSTRAINT fk_hospital_historial FOREIGN KEY (id_historial) REFERENCES historial_clinico(id_historial) ON DELETE CASCADE,
    UNIQUE (id_historial, motivo, fecha)
);

-- =========================
-- Tabla Medicamentos Actuales
-- =========================
CREATE TABLE historial_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    nombre_medicamento VARCHAR(255) NOT NULL,
    dosis VARCHAR(50),
    frecuencia VARCHAR(50),
    CONSTRAINT fk_medic_historial FOREIGN KEY (id_historial) REFERENCES historial_clinico(id_historial) ON DELETE CASCADE,
    UNIQUE (id_historial, nombre_medicamento, dosis, frecuencia)
);