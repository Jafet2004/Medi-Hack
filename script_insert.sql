-- Ejemplo de Inserciones
-- =========================
INSERT INTO usuarios (tipo_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena)
VALUES 
('paciente', 'Maria', 'Josefa', 'Lopez', 'Perez', '001-123456-0000X', 'maria@gmail.com', 'MJ330098'),
('trabajador', 'Juan', 'Carlos', 'Ruiz', 'Martinez', '002-654321-0000X', 'juanruiz@gmail.com', 'JcR24876'),
('administracion', 'Pedro', NULL, 'Gomez', 'Ramos', '003-112233-0000X', 'pedrog@gmail.com', 'PR003477');

INSERT INTO pacientes (id_paciente, fecha_nacimiento, celular, direccion, genero, ocupacion, estado_civil, cod_pac)
VALUES (1, '1985-04-10', '88888888', 'Managua, Nicaragua', 'F', 'Ingeniera', 'Casado', 'PAC-2025-0001');


INSERT INTO trabajadores_salud (id_trabajador, codigo_minsa)
VALUES (2, 'MINSA-12345');

-- Insertar más usuarios trabajadores de salud
INSERT INTO usuarios (tipo_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena)
VALUES 
('trabajador', 'Ana', 'Isabel', 'García', 'Hernández', '004-778899-0000X', 'ana.garcia@gmail.com', 'AG778899'),
('trabajador', 'Carlos', 'Alberto', 'Rodríguez', 'Silva', '005-445566-0000X', 'carlos.rodriguez@gmail.com', 'CR445566'),
('trabajador', 'Marta', 'Elena', 'Fernández', 'Castro', '006-334455-0000X', 'marta.fernandez@gmail.com', 'MF334455'),
('trabajador', 'Luis', 'Miguel', 'Díaz', 'Ortega', '007-556677-0000X', 'luis.diaz@gmail.com', 'LD556677'),
('trabajador', 'Sofia', 'Patricia', 'Morales', 'Rojas', '008-667788-0000X', 'sofia.morales@gmail.com', 'SM667788'),
('trabajador', 'Jorge', 'Antonio', 'Pérez', 'Mendoza', '009-889900-0000X', 'jorge.perez@gmail.com', 'JP889900'),
('trabajador', 'Elena', 'María', 'Ramírez', 'Vargas', '010-990011-0000X', 'elena.ramirez@gmail.com', 'ER990011'),
('trabajador', 'Roberto', 'José', 'Castillo', 'Guerrero', '011-112233-0000X', 'roberto.castillo@gmail.com', 'RC112233'),
('trabajador', 'Gabriela', 'Carmen', 'Herrera', 'Navarro', '012-223344-0000X', 'gabriela.herrera@gmail.com', 'GH223344'),
('trabajador', 'Diego', 'Armando', 'Luna', 'Salazar', '013-334455-0000X', 'diego.luna@gmail.com', 'DL334455');

-- Insertar los códigos MINSA para los trabajadores de salud
INSERT INTO trabajadores_salud (id_trabajador, codigo_minsa)
VALUES 
(7, 'MINSA-67890'),
(8, 'MINSA-54321'),
(9, 'MINSA-98765'),
(10, 'MINSA-13579'),
(11, 'MINSA-24680'),
(12, 'MINSA-86420'),
(13, 'MINSA-97531'),
(14, 'MINSA-11223'),
(15, 'MINSA-44556'),
(16, 'MINSA-77889');

INSERT INTO especialidades (nombre_especialidad) VALUES 
('Medicina Interna'),
('Pediatría'),
('Cirugía General'),
('Ginecología y Obstetricia');

INSERT INTO trabajador_especialidad (id_trabajador, id_especialidad) VALUES 
(2, 1),
(2, 3);