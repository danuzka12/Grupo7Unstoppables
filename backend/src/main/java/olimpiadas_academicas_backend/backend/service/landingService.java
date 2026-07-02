package olimpiadas_academicas_backend.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class landingService {

    private final JdbcTemplate jdbc;

    public landingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> resumen() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("estadisticas", estadisticas());
        data.put("proximosEventos", proximosEventos());
        data.put("ultimosResultados", ultimosResultados());
        data.put("tablaPosiciones", tablaPosicionesGeneral());
        data.put("disciplinas", disciplinas());
        return data;
    }

    // ── Contadores para el hero ─────────────────────────────
    private Map<String, Object> estadisticas() {
        Integer disciplinas = jdbc.queryForObject(
                "SELECT COUNT(*) FROM deporte WHERE estado = 'ACTIVO'", Integer.class);
        Integer eventos = jdbc.queryForObject(
                "SELECT COUNT(*) FROM evento WHERE estado <> 'CANCELADO'", Integer.class);
        Integer instituciones = jdbc.queryForObject(
                "SELECT COUNT(*) FROM institucion WHERE activo = 1", Integer.class);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("disciplinas", disciplinas);
        m.put("eventos", eventos);
        m.put("instituciones", instituciones);
        return m;
    }

    // ── Próximos eventos (abiertos, en curso o con fecha futura) ───
    public List<Map<String, Object>> proximosEventos() {
        return jdbc.queryForList("""
                SELECT e.id_evento AS idEvento,
                       e.nombre,
                       e.descripcion,
                       e.fecha_inicio AS fechaInicio,
                       e.fecha_fin AS fechaFin,
                       e.estado,
                       e.premio,
                       (SELECT GROUP_CONCAT(DISTINCT d.nombre ORDER BY d.nombre SEPARATOR ', ')
                          FROM evento_deporte ed
                          JOIN deporte d ON d.id_deporte = ed.id_deporte
                         WHERE ed.id_evento = e.id_evento) AS disciplinas
                FROM evento e
                WHERE e.estado IN ('ABIERTO','EN_CURSO')
                   OR e.fecha_inicio >= CURDATE()
                ORDER BY e.fecha_inicio ASC
                LIMIT 6
                """);
    }

    // ── Últimos 3 resultados publicados ─────────────────────
    public List<Map<String, Object>> ultimosResultados() {
        return jdbc.queryForList("""
                SELECT r.id_resultado AS idResultado,
                       dep.nombre AS disciplina,
                       cat.nombre AS categoria,
                       ev.nombre AS evento,
                       el.nombre AS equipoLocal,
                       evt.nombre AS equipoVisitante,
                       r.goles_local AS golesLocal,
                       r.goles_visitante AS golesVisitante,
                       r.ganador,
                       p.fase,
                       r.fecha_registro AS fechaRegistro
                FROM resultado r
                JOIN partido p ON p.id_partido = r.id_partido
                JOIN equipo el ON el.id_equipo = p.id_equipo_local
                JOIN equipo evt ON evt.id_equipo = p.id_equipo_visitante
                JOIN evento_deporte ed ON ed.id_evento_deporte = p.id_evento_deporte
                JOIN deporte dep ON dep.id_deporte = ed.id_deporte
                JOIN categoria cat ON cat.id_categoria = ed.id_categoria
                JOIN evento ev ON ev.id_evento = ed.id_evento
                WHERE r.publicado = 1
                ORDER BY r.fecha_registro DESC
                LIMIT 3
                """);
    }

    // ── Tabla de posiciones general (provisional, ver nota de clase) ──
    public List<Map<String, Object>> tablaPosicionesGeneral() {
        return jdbc.queryForList("""
                SELECT inst.id_institucion AS idInstitucion,
                       inst.nombre AS institucion,
                       COUNT(*) AS partidosJugados,
                       SUM(pe.resultado = 'V') AS victorias,
                       SUM(pe.resultado = 'E') AS empates,
                       SUM(pe.resultado = 'D') AS derrotas,
                       SUM(pe.gf) AS golesFavor,
                       SUM(pe.gc) AS golesContra,
                       (SUM(pe.gf) - SUM(pe.gc)) AS diferenciaGoles,
                       SUM(CASE WHEN pe.resultado = 'V' THEN 3
                                WHEN pe.resultado = 'E' THEN 1
                                ELSE 0 END) AS puntos
                FROM (
                    SELECT p.id_equipo_local AS id_equipo,
                           r.goles_local AS gf,
                           r.goles_visitante AS gc,
                           CASE WHEN r.ganador = 'LOCAL' THEN 'V'
                                WHEN r.ganador = 'EMPATE' THEN 'E'
                                ELSE 'D' END AS resultado
                    FROM partido p
                    JOIN resultado r ON r.id_partido = p.id_partido
                    WHERE p.estado = 'FINALIZADO'
                    UNION ALL
                    SELECT p.id_equipo_visitante AS id_equipo,
                           r.goles_visitante AS gf,
                           r.goles_local AS gc,
                           CASE WHEN r.ganador = 'VISITANTE' THEN 'V'
                                WHEN r.ganador = 'EMPATE' THEN 'E'
                                ELSE 'D' END AS resultado
                    FROM partido p
                    JOIN resultado r ON r.id_partido = p.id_partido
                    WHERE p.estado = 'FINALIZADO'
                ) pe
                JOIN equipo eq ON eq.id_equipo = pe.id_equipo
                JOIN institucion inst ON inst.id_institucion = eq.id_institucion
                GROUP BY inst.id_institucion, inst.nombre
                ORDER BY puntos DESC, diferenciaGoles DESC, golesFavor DESC
                LIMIT 10
                """);
    }

    // ── Disciplinas activas registradas en el sistema ───────
    public List<Map<String, Object>> disciplinas() {
        return jdbc.queryForList("""
                SELECT d.id_deporte AS idDeporte,
                       d.nombre,
                       d.tipo,
                       d.descripcion,
                       (SELECT COUNT(DISTINCT ed.id_evento)
                          FROM evento_deporte ed
                         WHERE ed.id_deporte = d.id_deporte) AS eventosActivos
                FROM deporte d
                WHERE d.estado = 'ACTIVO'
                ORDER BY d.nombre
                """);
    }
}
