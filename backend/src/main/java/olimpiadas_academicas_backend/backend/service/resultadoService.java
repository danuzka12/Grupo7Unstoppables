package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.resultadoDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * NOTA: por ahora el registro de estadísticas está hardcodeado para fútbol
 * (solo se registran goles por jugador). Cuando se generalice el sistema a
 * otros deportes, esto debe refactorizarse junto con el modelo de datos
 * (estadistica_jugador) para soportar métricas distintas según el deporte.
 */
@Service
public class resultadoService {

    private final JdbcTemplate jdbc;

    public resultadoService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Partidos de la competencia que ya tienen resultado registrado
    public List<Map<String, Object>> listar(Long idEventoDeporte) {
        return jdbc.queryForList("""
                SELECT p.id_partido AS idPartido,
                       p.id_evento_deporte AS idEventoDeporte,
                       g.nombre AS grupo,
                       el.id_equipo AS idEquipoLocal,
                       el.nombre AS equipoLocal,
                       ev.id_equipo AS idEquipoVisitante,
                       ev.nombre AS equipoVisitante,
                       p.fecha_hora AS fechaHora,
                       p.fase,
                       r.id_resultado AS idResultado,
                       r.goles_local AS golesLocal,
                       r.goles_visitante AS golesVisitante,
                       r.ganador,
                       r.observaciones,
                       r.publicado,
                       r.fecha_registro AS fechaRegistro
                FROM partido p
                LEFT JOIN grupo g ON g.id_grupo = p.id_grupo
                JOIN equipo el ON el.id_equipo = p.id_equipo_local
                JOIN equipo ev ON ev.id_equipo = p.id_equipo_visitante
                JOIN resultado r ON r.id_partido = p.id_partido
                WHERE p.id_evento_deporte = ?
                ORDER BY r.fecha_registro DESC
                """, idEventoDeporte);
    }

    // Partidos programados que aún no tienen resultado registrado
    public List<Map<String, Object>> pendientes(Long idEventoDeporte) {
        return jdbc.queryForList("""
                SELECT p.id_partido AS idPartido,
                       p.id_evento_deporte AS idEventoDeporte,
                       g.nombre AS grupo,
                       el.id_equipo AS idEquipoLocal,
                       el.nombre AS equipoLocal,
                       ev.id_equipo AS idEquipoVisitante,
                       ev.nombre AS equipoVisitante,
                       s.nombre AS sede,
                       p.fecha_hora AS fechaHora,
                       p.fase,
                       p.estado
                FROM partido p
                LEFT JOIN grupo g ON g.id_grupo = p.id_grupo
                JOIN equipo el ON el.id_equipo = p.id_equipo_local
                JOIN equipo ev ON ev.id_equipo = p.id_equipo_visitante
                LEFT JOIN sede s ON s.id_sede = p.id_sede
                LEFT JOIN resultado r ON r.id_partido = p.id_partido
                WHERE p.id_evento_deporte = ?
                  AND r.id_resultado IS NULL
                  AND p.estado NOT IN ('CANCELADO')
                ORDER BY p.fecha_hora, g.nombre, p.id_partido
                """, idEventoDeporte);
    }

    // Jugadores inscritos (activos) de ambos equipos de un partido, para marcar
    // goleadores
    public List<Map<String, Object>> jugadoresDePartido(Long idPartido) {
        Map<String, Object> partido = obtenerPartidoOFallar(idPartido);
        Long idEquipoLocal = ((Number) partido.get("idEquipoLocal")).longValue();
        Long idEquipoVisitante = ((Number) partido.get("idEquipoVisitante")).longValue();

        return jdbc.queryForList("""
                SELECT ep.id_participante AS idParticipante,
                       par.nombres,
                       par.apellidos,
                       eq.id_equipo AS idEquipo,
                       eq.nombre AS equipoNombre,
                       CASE WHEN eq.id_equipo = ? THEN 'LOCAL' ELSE 'VISITANTE' END AS rol,
                       ep.es_capitan AS esCapitan
                FROM equipo_participante ep
                JOIN participante par ON par.id_participante = ep.id_participante
                JOIN equipo eq ON eq.id_equipo = ep.id_equipo
                WHERE ep.id_equipo IN (?, ?)
                  AND ep.estado = 'ACTIVO'
                ORDER BY rol DESC, par.apellidos, par.nombres
                """, idEquipoLocal, idEquipoLocal, idEquipoVisitante);
    }

    @Transactional
    public Map<String, Object> registrar(resultadoDTO dto) {
        Map<String, Object> partido = obtenerPartidoOFallar(dto.getIdPartido());

        String estadoPartido = (String) partido.get("estado");
        if ("CANCELADO".equals(estadoPartido)) {
            throw new IllegalArgumentException("No se puede registrar el resultado de un partido cancelado.");
        }

        Integer yaTieneResultado = jdbc.queryForObject(
                "SELECT COUNT(*) FROM resultado WHERE id_partido = ?", Integer.class, dto.getIdPartido());
        if (yaTieneResultado != null && yaTieneResultado > 0) {
            throw new IllegalArgumentException("Este partido ya tiene un resultado registrado.");
        }

        int golesLocal = dto.getGolesLocal();
        int golesVisitante = dto.getGolesVisitante();
        String ganador = golesLocal > golesVisitante ? "LOCAL"
                : golesVisitante > golesLocal ? "VISITANTE" : "EMPATE";

        jdbc.update("""
                INSERT INTO resultado (id_partido, goles_local, goles_visitante, ganador,
                                        observaciones, publicado, id_usuario_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, dto.getIdPartido(), golesLocal, golesVisitante, ganador,
                dto.getObservaciones(), Boolean.TRUE.equals(dto.getPublicado()), dto.getIdUsuarioRegistro());

        jdbc.update("UPDATE partido SET estado = 'FINALIZADO' WHERE id_partido = ?", dto.getIdPartido());

        Long idEquipoLocal = ((Number) partido.get("idEquipoLocal")).longValue();
        Long idEquipoVisitante = ((Number) partido.get("idEquipoVisitante")).longValue();
        registrarEstadisticasJugadores(dto, idEquipoLocal, idEquipoVisitante);

        return detallePorPartido(dto.getIdPartido());
    }

    private void registrarEstadisticasJugadores(resultadoDTO dto, Long idEquipoLocal, Long idEquipoVisitante) {
        if (dto.getEstadisticas() == null || dto.getEstadisticas().isEmpty()) {
            return;
        }

        for (resultadoDTO.EstadisticaJugadorItem item : dto.getEstadisticas()) {
            if (item.getGoles() == null || item.getGoles() <= 0) {
                continue; // solo se guardan jugadores que realmente anotaron
            }

            Integer coincidencias = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM equipo_participante
                    WHERE id_participante = ? AND id_equipo IN (?, ?) AND estado = 'ACTIVO'
                    """, Integer.class, item.getIdParticipante(), idEquipoLocal, idEquipoVisitante);

            if (coincidencias == null || coincidencias == 0) {
                throw new IllegalArgumentException(
                        "El participante " + item.getIdParticipante()
                                + " no está inscrito en ninguno de los dos equipos del partido.");
            }

            jdbc.update("""
                    INSERT INTO estadistica_jugador (id_partido, id_participante, goles)
                    VALUES (?, ?, ?)
                    """, dto.getIdPartido(), item.getIdParticipante(), item.getGoles());
        }
    }

    public Map<String, Object> togglePublicado(Long idResultado) {
        Map<String, Object> resultado = jdbc.queryForMap(
                "SELECT id_partido AS idPartido, publicado FROM resultado WHERE id_resultado = ?", idResultado);
        boolean nuevoEstado = !((Boolean) resultado.get("publicado"));
        jdbc.update("UPDATE resultado SET publicado = ? WHERE id_resultado = ?", nuevoEstado, idResultado);
        return detallePorPartido(((Number) resultado.get("idPartido")).longValue());
    }

    // Detalle de un resultado + goleadores registrados, a partir del id de partido
    public Map<String, Object> detallePorPartido(Long idPartido) {
        Map<String, Object> resultado = jdbc.queryForMap("""
                SELECT p.id_partido AS idPartido,
                       g.nombre AS grupo,
                       el.nombre AS equipoLocal,
                       ev.nombre AS equipoVisitante,
                       p.fecha_hora AS fechaHora,
                       r.id_resultado AS idResultado,
                       r.goles_local AS golesLocal,
                       r.goles_visitante AS golesVisitante,
                       r.ganador,
                       r.observaciones,
                       r.publicado,
                       r.fecha_registro AS fechaRegistro
                FROM partido p
                LEFT JOIN grupo g ON g.id_grupo = p.id_grupo
                JOIN equipo el ON el.id_equipo = p.id_equipo_local
                JOIN equipo ev ON ev.id_equipo = p.id_equipo_visitante
                JOIN resultado r ON r.id_partido = p.id_partido
                WHERE p.id_partido = ?
                """, idPartido);

        List<Map<String, Object>> goleadores = jdbc.queryForList("""
                SELECT ej.id_participante AS idParticipante,
                       par.nombres, par.apellidos,
                       eq.id_equipo AS idEquipo, eq.nombre AS equipoNombre,
                       ej.goles
                FROM estadistica_jugador ej
                JOIN participante par ON par.id_participante = ej.id_participante
                JOIN equipo_participante ep ON ep.id_participante = ej.id_participante
                JOIN equipo eq ON eq.id_equipo = ep.id_equipo
                WHERE ej.id_partido = ?
                  AND eq.id_equipo IN (
                      SELECT id_equipo_local FROM partido WHERE id_partido = ?
                      UNION
                      SELECT id_equipo_visitante FROM partido WHERE id_partido = ?
                  )
                ORDER BY ej.goles DESC, par.apellidos
                """, idPartido, idPartido, idPartido);

        resultado.put("goleadores", goleadores);
        return resultado;
    }

    private Map<String, Object> obtenerPartidoOFallar(Long idPartido) {
        List<Map<String, Object>> filas = jdbc.queryForList("""
                SELECT id_partido AS idPartido, id_equipo_local AS idEquipoLocal,
                       id_equipo_visitante AS idEquipoVisitante, estado
                FROM partido
                WHERE id_partido = ?
                """, idPartido);
        if (filas.isEmpty()) {
            throw new IllegalArgumentException("Partido no encontrado: " + idPartido);
        }
        return filas.get(0);
    }
}
