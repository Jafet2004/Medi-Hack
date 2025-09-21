-- Ejemplo de Inserciones
-- =========================
INSERT INTO usuarios (tipo_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, correo, contrasena)
VALUES 
('paciente', 'Maria', 'Josefa', 'Lopez', 'Perez', '001-123456-0000X', 'maria@example.com', 'MJ330098'),
('trabajador', 'Juan', 'Carlos', 'Ruiz', 'Martinez', '002-654321-0000X', 'juanruiz@example.com', 'JcR24876'),
('administracion', 'Pedro', NULL, 'Gomez', 'Ramos', '003-112233-0000X', 'pedrog@example.com', 'PR003477');

INSERT INTO pacientes (id_paciente, fecha_nacimiento, celular, direccion, genero, ocupacion, estado_civil)
VALUES (1, '1985-04-10', '88888888', 'Managua, Nicaragua', 'F', 'Ingeniera', 'Casado');

INSERT INTO trabajadores_salud (id_trabajador, codigo_minsa)
VALUES (2, 'MINSA-12345');

INSERT INTO especialidades (nombre_especialidad) VALUES 
('Medicina Interna'),
('Pediatría'),
('Cirugía General'),
('Ginecología y Obstetricia');

INSERT INTO trabajador_especialidad (id_trabajador, id_especialidad) VALUES 
(2, 1),
(2, 3);