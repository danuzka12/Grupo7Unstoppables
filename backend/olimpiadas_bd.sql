-- =====================================================
-- BASE DE DATOS: Olimpiadas Deportivas UTP
-- Sistema de gestión de eventos deportivos
-- Motor: MySQL / MariaDB
-- =====================================================

-- =====================================================
-- LIMPIEZA INICIAL (DROP TABLES)
-- =====================================================
DROP TABLE IF EXISTS v_tabla_posicion CASCADE;
DROP TABLE IF EXISTS v_proximos_partidos CASCADE;
DROP TABLE IF EXISTS v_goleadores CASCADE;

DROP TABLE IF EXISTS sorteo_log;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS tabla_posicion;
DROP TABLE IF EXISTS resultado;
DROP TABLE IF EXISTS partido;
DROP TABLE IF EXISTS participante;
DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS sede;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS institucion;
DROP TABLE IF EXISTS grupo_equipo;
DROP TABLE IF EXISTS grupo;
DROP TABLE IF EXISTS evento_deporte;
DROP TABLE IF EXISTS evento;
DROP TABLE IF EXISTS estadistica_jugador;
DROP TABLE IF EXISTS equipo_participante;
DROP TABLE IF EXISTS equipo;
DROP TABLE IF EXISTS deporte_categoria;
DROP TABLE IF EXISTS deporte;
DROP TABLE IF EXISTS categoria;

-- =====================================================
-- CATÁLOGOS BASE
-- =====================================================

CREATE TABLE categoria (
    id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE deporte (
    id_deporte INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo ENUM('INDIVIDUAL','GRUPAL') DEFAULT 'GRUPAL',
    max_jugadores TINYINT UNSIGNED,
    min_jugadores TINYINT UNSIGNED,
    estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE deporte_categoria (
    id_deporte_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_deporte INT UNSIGNED,
    id_categoria INT UNSIGNED,
    UNIQUE (id_deporte, id_categoria),
    FOREIGN KEY (id_deporte) REFERENCES deporte(id_deporte),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- =====================================================
-- ENTIDADES PRINCIPALES
-- =====================================================

CREATE TABLE institucion (
    id_institucion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100),
    logo_url VARCHAR(255),
    activo BOOLEAN DEFAULT 1
);

CREATE TABLE rol (
    id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE usuario (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_institucion INT UNSIGNED,
    id_rol INT UNSIGNED NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (id_institucion) REFERENCES institucion(id_institucion),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- =====================================================
-- EVENTOS Y COMPETENCIA
-- =====================================================

CREATE TABLE evento (
    id_evento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_institucion INT UNSIGNED,
    nombre VARCHAR(150),
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_limite_insc DATE,
    premio VARCHAR(255),
    min_equipos TINYINT DEFAULT 2,
    estado ENUM('BORRADOR','ABIERTO','EN_CURSO','FINALIZADO','CANCELADO') DEFAULT 'BORRADOR',
    id_usuario_creador INT UNSIGNED,
    FOREIGN KEY (id_institucion) REFERENCES institucion(id_institucion),
    FOREIGN KEY (id_usuario_creador) REFERENCES usuario(id_usuario)
);

CREATE TABLE evento_deporte (
    id_evento_deporte INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_evento INT UNSIGNED,
    id_deporte INT UNSIGNED,
    id_categoria INT UNSIGNED,
    min_participacion TINYINT DEFAULT 1,
    UNIQUE (id_evento, id_deporte, id_categoria),
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento),
    FOREIGN KEY (id_deporte) REFERENCES deporte(id_deporte),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- =====================================================
-- EQUIPOS Y PARTICIPANTES
-- =====================================================

CREATE TABLE equipo (
    id_equipo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_evento_deporte INT UNSIGNED,
    id_institucion INT UNSIGNED,
    nombre VARCHAR(100),
    color_uniforme VARCHAR(50),
    estado_inscripcion ENUM('PENDIENTE','APROBADO','RECHAZADO','RETIRADO') DEFAULT 'PENDIENTE',
    FOREIGN KEY (id_evento_deporte) REFERENCES evento_deporte(id_evento_deporte),
    FOREIGN KEY (id_institucion) REFERENCES institucion(id_institucion)
);

CREATE TABLE participante (
    id_participante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_institucion INT UNSIGNED,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    dni VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(20),
    FOREIGN KEY (id_institucion) REFERENCES institucion(id_institucion)
);

CREATE TABLE equipo_participante (
    id_equipo_participante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_equipo INT UNSIGNED,
    id_participante INT UNSIGNED,
    es_capitan BOOLEAN DEFAULT 0,
    UNIQUE (id_equipo, id_participante),
    FOREIGN KEY (id_equipo) REFERENCES equipo(id_equipo),
    FOREIGN KEY (id_participante) REFERENCES participante(id_participante)
);

-- =====================================================
-- PARTIDOS Y RESULTADOS
-- =====================================================

CREATE TABLE partido (
    id_partido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_evento_deporte INT UNSIGNED,
    id_grupo INT UNSIGNED,
    id_equipo_local INT UNSIGNED,
    id_equipo_visitante INT UNSIGNED,
    fecha_hora DATETIME,
    estado ENUM('PROGRAMADO','EN_CURSO','FINALIZADO','POSTERGADO','CANCELADO'),
    FOREIGN KEY (id_evento_deporte) REFERENCES evento_deporte(id_evento_deporte)
);

CREATE TABLE resultado (
    id_resultado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_partido INT UNSIGNED UNIQUE,
    goles_local TINYINT DEFAULT 0,
    goles_visitante TINYINT DEFAULT 0,
    ganador ENUM('LOCAL','VISITANTE','EMPATE'),
    FOREIGN KEY (id_partido) REFERENCES partido(id_partido)
);

-- =====================================================
-- VISTAS (REPORTES)
-- =====================================================

CREATE OR REPLACE VIEW v_goleadores AS
SELECT ...;

CREATE OR REPLACE VIEW v_proximos_partidos AS
SELECT ...;

CREATE OR REPLACE VIEW v_tabla_posicion AS
SELECT ...;

-- =====================================================
-- DATOS INICIALES (SEED)
-- =====================================================

INSERT INTO categoria (nombre) VALUES
('VARONES'), ('DAMAS'), ('MIXTO'), ('LIBRE');

INSERT INTO deporte (nombre, tipo) VALUES
('Fútbol','GRUPAL'),
('Vóley','GRUPAL'),
('Básquet','GRUPAL'),
('Atletismo','INDIVIDUAL'),
('Natación','INDIVIDUAL'),
('Ajedrez','INDIVIDUAL');

INSERT INTO institucion (nombre, email) VALUES
('Universidad Tecnológica del Perú','olimpiadas@utp.edu.pe');

INSERT INTO rol (nombre, descripcion) VALUES
('ADMIN_SISTEMA','Administrador general del sistema'),
('ARBITRO','Encargado de partidos'),
('PARTICIPANTE','Jugador');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================