USE olimpiadas_bd;

-- =====================================================
-- DATOS DE PRUEBA PARA EL MÓDULO DE SORTEO
-- Ejecutar después de importar olimpiadas_bd.sql.
-- No crea tablas nuevas: solo inserta datos en tablas existentes.
-- Credenciales admin de la BD base:
--   admin@utp.edu.pe / admin123
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DELETE r
FROM resultado r
JOIN partido p ON p.id_partido = r.id_partido
JOIN evento_deporte ed ON ed.id_evento_deporte = p.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE p
FROM partido p
JOIN evento_deporte ed ON ed.id_evento_deporte = p.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE ge
FROM grupo_equipo ge
JOIN grupo g ON g.id_grupo = ge.id_grupo
JOIN evento_deporte ed ON ed.id_evento_deporte = g.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE g
FROM grupo g
JOIN evento_deporte ed ON ed.id_evento_deporte = g.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE sl
FROM sorteo_log sl
JOIN evento_deporte ed ON ed.id_evento_deporte = sl.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE ep
FROM equipo_participante ep
JOIN equipo eq ON eq.id_equipo = ep.id_equipo
JOIN evento_deporte ed ON ed.id_evento_deporte = eq.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE eq
FROM equipo eq
JOIN evento_deporte ed ON ed.id_evento_deporte = eq.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE ed
FROM evento_deporte ed
JOIN evento e ON e.id_evento = ed.id_evento
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE FROM evento
WHERE nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

DELETE FROM participante
WHERE dni BETWEEN '990001' AND '990060';

DELETE FROM institucion
WHERE nombre IN (
  'Instituto Demo Norte',
  'Instituto Demo Sur',
  'Colegio Demo Central',
  'Academia Demo Este'
);

SET FOREIGN_KEY_CHECKS = 1;

-- Instituciones participantes
INSERT INTO institucion (nombre, direccion, telefono, email, activo) VALUES
('Instituto Demo Norte', 'Av. Los Próceres 120', '900111222', 'norte@demo.edu.pe', 1),
('Instituto Demo Sur', 'Jr. Las Palmeras 450', '900333444', 'sur@demo.edu.pe', 1),
('Colegio Demo Central', 'Av. Central 777', '900555666', 'central@demo.edu.pe', 1),
('Academia Demo Este', 'Calle Los Pinos 321', '900777888', 'este@demo.edu.pe', 1);

-- Eventos distintos para probar filtros y sorteos independientes
INSERT INTO evento (id_institucion, nombre, descripcion, fecha_inicio, fecha_fin, fecha_limite_insc, premio, min_equipos, estado, id_usuario_creador) VALUES
((SELECT id_institucion FROM institucion WHERE nombre = 'Universidad Tecnológica del Perú' LIMIT 1), 'Copa Interfacultades 2026', 'Evento de prueba con fútbol y vóley para sorteo por grupos.', '2026-07-15', '2026-07-22', '2026-07-10', 'Trofeo institucional', 4, 'ABIERTO', 1),
((SELECT id_institucion FROM institucion WHERE nombre = 'Universidad Tecnológica del Perú' LIMIT 1), 'Juegos de Verano 2026', 'Evento de prueba con básquet femenino.', '2026-08-05', '2026-08-12', '2026-08-01', 'Medallas y diplomas', 4, 'ABIERTO', 1),
((SELECT id_institucion FROM institucion WHERE nombre = 'Universidad Tecnológica del Perú' LIMIT 1), 'Torneo Relámpago 2026', 'Evento de prueba con pocos equipos para validar límites de grupos.', '2026-09-03', '2026-09-05', '2026-08-30', 'Reconocimiento deportivo', 2, 'ABIERTO', 1);

-- Competencias por evento
INSERT INTO evento_deporte (id_evento, id_deporte, id_categoria, min_participacion) VALUES
((SELECT id_evento FROM evento WHERE nombre = 'Copa Interfacultades 2026'), (SELECT id_deporte FROM deporte WHERE nombre = 'Fútbol'), (SELECT id_categoria FROM categoria WHERE nombre = 'VARONES'), 7),
((SELECT id_evento FROM evento WHERE nombre = 'Copa Interfacultades 2026'), (SELECT id_deporte FROM deporte WHERE nombre = 'Vóley'), (SELECT id_categoria FROM categoria WHERE nombre = 'MIXTO'), 6),
((SELECT id_evento FROM evento WHERE nombre = 'Juegos de Verano 2026'), (SELECT id_deporte FROM deporte WHERE nombre = 'Básquet'), (SELECT id_categoria FROM categoria WHERE nombre = 'DAMAS'), 5),
((SELECT id_evento FROM evento WHERE nombre = 'Torneo Relámpago 2026'), (SELECT id_deporte FROM deporte WHERE nombre = 'Ajedrez'), (SELECT id_categoria FROM categoria WHERE nombre = 'LIBRE'), 1);

-- Participantes de prueba
INSERT INTO participante (id_institucion, nombres, apellidos, dni, email, telefono) VALUES
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Lucía', 'Ramos', '990001', 'lucia.ramos@demo.edu.pe', '911001001'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Mateo', 'Soto', '990002', 'mateo.soto@demo.edu.pe', '911001002'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Valeria', 'Paredes', '990003', 'valeria.paredes@demo.edu.pe', '911001003'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Diego', 'Mendoza', '990004', 'diego.mendoza@demo.edu.pe', '911001004'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Camila', 'Torres', '990005', 'camila.torres@demo.edu.pe', '911001005'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'André', 'Campos', '990006', 'andre.campos@demo.edu.pe', '911001006'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Sofía', 'Cruz', '990007', 'sofia.cruz@demo.edu.pe', '911001007'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Joaquín', 'Reyes', '990008', 'joaquin.reyes@demo.edu.pe', '911001008'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Renata', 'Vega', '990009', 'renata.vega@demo.edu.pe', '911001009'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Thiago', 'Luna', '990010', 'thiago.luna@demo.edu.pe', '911001010'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'María', 'Flores', '990011', 'maria.flores@demo.edu.pe', '911001011'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Norte'), 'Nicolás', 'Arias', '990012', 'nicolas.arias@demo.edu.pe', '911001012'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Daniela', 'Rojas', '990013', 'daniela.rojas@demo.edu.pe', '911001013'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Sebastián', 'Navarro', '990014', 'sebastian.navarro@demo.edu.pe', '911001014'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Paula', 'Ibarra', '990015', 'paula.ibarra@demo.edu.pe', '911001015'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Gabriel', 'Salas', '990016', 'gabriel.salas@demo.edu.pe', '911001016'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Antonella', 'Mejía', '990017', 'antonella.mejia@demo.edu.pe', '911001017'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Bruno', 'Peña', '990018', 'bruno.pena@demo.edu.pe', '911001018'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Fernanda', 'Castro', '990019', 'fernanda.castro@demo.edu.pe', '911001019'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Tomás', 'León', '990020', 'tomas.leon@demo.edu.pe', '911001020'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Elena', 'Mora', '990021', 'elena.mora@demo.edu.pe', '911001021'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Adrián', 'Paz', '990022', 'adrian.paz@demo.edu.pe', '911001022'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Clara', 'Vargas', '990023', 'clara.vargas@demo.edu.pe', '911001023'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Instituto Demo Sur'), 'Iker', 'Silva', '990024', 'iker.silva@demo.edu.pe', '911001024'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Julieta', 'Ortega', '990025', 'julieta.ortega@demo.edu.pe', '911001025'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Emiliano', 'Quispe', '990026', 'emiliano.quispe@demo.edu.pe', '911001026'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Abril', 'Cáceres', '990027', 'abril.caceres@demo.edu.pe', '911001027'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Rodrigo', 'Núñez', '990028', 'rodrigo.nunez@demo.edu.pe', '911001028'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Ariana', 'Herrera', '990029', 'ariana.herrera@demo.edu.pe', '911001029'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Facundo', 'Bravo', '990030', 'facundo.bravo@demo.edu.pe', '911001030'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Martina', 'Díaz', '990031', 'martina.diaz@demo.edu.pe', '911001031'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Leonardo', 'Aguilar', '990032', 'leonardo.aguilar@demo.edu.pe', '911001032'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Isabella', 'Romero', '990033', 'isabella.romero@demo.edu.pe', '911001033'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Samuel', 'Pinto', '990034', 'samuel.pinto@demo.edu.pe', '911001034'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Micaela', 'Ríos', '990035', 'micaela.rios@demo.edu.pe', '911001035'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Colegio Demo Central'), 'Gael', 'Fuentes', '990036', 'gael.fuentes@demo.edu.pe', '911001036'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Alessia', 'Córdova', '990037', 'alessia.cordova@demo.edu.pe', '911001037'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Benjamín', 'Molina', '990038', 'benjamin.molina@demo.edu.pe', '911001038'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Catalina', 'Gómez', '990039', 'catalina.gomez@demo.edu.pe', '911001039'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Dylan', 'Chávez', '990040', 'dylan.chavez@demo.edu.pe', '911001040'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Regina', 'Acosta', '990041', 'regina.acosta@demo.edu.pe', '911001041'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Álvaro', 'Lozano', '990042', 'alvaro.lozano@demo.edu.pe', '911001042'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Josefina', 'Medina', '990043', 'josefina.medina@demo.edu.pe', '911001043'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Maximiliano', 'Santos', '990044', 'maximiliano.santos@demo.edu.pe', '911001044'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Romina', 'Miranda', '990045', 'romina.miranda@demo.edu.pe', '911001045'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Santiago', 'Palacios', '990046', 'santiago.palacios@demo.edu.pe', '911001046'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Ana', 'Zamora', '990047', 'ana.zamora@demo.edu.pe', '911001047'),
((SELECT id_institucion FROM institucion WHERE nombre = 'Academia Demo Este'), 'Hugo', 'Ponce', '990048', 'hugo.ponce@demo.edu.pe', '911001048');

-- Equipos para probar sorteo con distintos tamaños:
-- Fútbol VARONES: 8 equipos -> permite 2, 3 o 4 grupos.
-- Vóley MIXTO: 6 equipos -> permite 2 o 3 grupos.
-- Básquet DAMAS: 5 equipos -> permite 2 grupos con distribución impar.
-- Ajedrez LIBRE: 3 equipos -> prueba caso pequeño.
INSERT INTO equipo (id_evento_deporte, id_institucion, nombre, color_uniforme, estado_inscripcion) VALUES
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Norte FC', 'Azul', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Sur Atlético', 'Rojo', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Colegio Demo Central'), 'Central United', 'Blanco', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Academia Demo Este'), 'Este Club', 'Verde', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Halcones Demo', 'Negro', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Titanes Demo', 'Morado', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Colegio Demo Central'), 'Cóndores Demo', 'Amarillo', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Fútbol' AND c.nombre='VARONES'), (SELECT id_institucion FROM institucion WHERE nombre='Academia Demo Este'), 'Linces Demo', 'Celeste', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Norte Vóley', 'Azul', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Sur Vóley', 'Rojo', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Colegio Demo Central'), 'Central Vóley', 'Blanco', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Academia Demo Este'), 'Este Vóley', 'Verde', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Águilas Vóley', 'Negro', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Copa Interfacultades 2026' AND d.nombre='Vóley' AND c.nombre='MIXTO'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Pumas Vóley', 'Morado', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Juegos de Verano 2026' AND d.nombre='Básquet' AND c.nombre='DAMAS'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Norte Básquet Damas', 'Azul', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Juegos de Verano 2026' AND d.nombre='Básquet' AND c.nombre='DAMAS'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Sur Básquet Damas', 'Rojo', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Juegos de Verano 2026' AND d.nombre='Básquet' AND c.nombre='DAMAS'), (SELECT id_institucion FROM institucion WHERE nombre='Colegio Demo Central'), 'Central Básquet Damas', 'Blanco', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Juegos de Verano 2026' AND d.nombre='Básquet' AND c.nombre='DAMAS'), (SELECT id_institucion FROM institucion WHERE nombre='Academia Demo Este'), 'Este Básquet Damas', 'Verde', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Juegos de Verano 2026' AND d.nombre='Básquet' AND c.nombre='DAMAS'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Estrellas Básquet', 'Dorado', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Torneo Relámpago 2026' AND d.nombre='Ajedrez' AND c.nombre='LIBRE'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Norte'), 'Norte Ajedrez', 'Azul', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Torneo Relámpago 2026' AND d.nombre='Ajedrez' AND c.nombre='LIBRE'), (SELECT id_institucion FROM institucion WHERE nombre='Instituto Demo Sur'), 'Sur Ajedrez', 'Rojo', 'APROBADO'),
((SELECT ed.id_evento_deporte FROM evento_deporte ed JOIN evento e ON e.id_evento = ed.id_evento JOIN deporte d ON d.id_deporte = ed.id_deporte JOIN categoria c ON c.id_categoria = ed.id_categoria WHERE e.nombre='Torneo Relámpago 2026' AND d.nombre='Ajedrez' AND c.nombre='LIBRE'), (SELECT id_institucion FROM institucion WHERE nombre='Colegio Demo Central'), 'Central Ajedrez', 'Blanco', 'APROBADO');

-- Miembros por equipo: se asocian 2 participantes por equipo para visualizar inscripción real.
INSERT INTO equipo_participante (id_equipo, id_participante, es_capitan)
SELECT eq.id_equipo, p.id_participante,
       CASE WHEN MOD(CAST(p.dni AS UNSIGNED), 2) = 1 THEN 1 ELSE 0 END
FROM equipo eq
JOIN evento_deporte ed ON ed.id_evento_deporte = eq.id_evento_deporte
JOIN evento e ON e.id_evento = ed.id_evento
JOIN participante p ON p.dni IN (
  LPAD(990000 + ((eq.id_equipo * 2 - 1 - 1) % 48) + 1, 6, '0'),
  LPAD(990000 + ((eq.id_equipo * 2 - 1) % 48) + 1, 6, '0')
)
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
);

-- Resumen para verificar carga
SELECT e.nombre AS evento, d.nombre AS deporte, c.nombre AS categoria,
       COUNT(DISTINCT eq.id_equipo) AS equipos,
       COUNT(DISTINCT ep.id_participante) AS miembros
FROM evento e
JOIN evento_deporte ed ON ed.id_evento = e.id_evento
JOIN deporte d ON d.id_deporte = ed.id_deporte
JOIN categoria c ON c.id_categoria = ed.id_categoria
LEFT JOIN equipo eq ON eq.id_evento_deporte = ed.id_evento_deporte
LEFT JOIN equipo_participante ep ON ep.id_equipo = eq.id_equipo
WHERE e.nombre IN (
  'Copa Interfacultades 2026',
  'Juegos de Verano 2026',
  'Torneo Relámpago 2026'
)
GROUP BY e.nombre, d.nombre, c.nombre
ORDER BY e.nombre, d.nombre, c.nombre;
