package olimpiadas_academicas_backend.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class partidoService {

    private final JdbcTemplate jdbc;

    public partidoService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listarSedes() {
        return jdbc.queryForList("""
            SELECT id_sede AS idSede, nombre, ubicacion
            FROM sede
            WHERE activo = 1
            ORDER BY nombre
            """);
    }

    public List<Map<String, Object>> listar(Long idEventoDeporte) {
        return jdbc.queryForList("""
            SELECT p.id_partido AS idPartido,
                   p.id_evento_deporte AS idEventoDeporte,
                   g.nombre AS grupo,
                   el.id_equipo AS idEquipoLocal,
                   el.nombre AS equipoLocal,
                   ev.id_equipo AS idEquipoVisitante,
                   ev.nombre AS equipoVisitante,
                   s.id_sede AS idSede,
                   s.nombre AS sede,
                   p.fecha_hora AS fechaHora,
                   p.fase,
                   p.estado
            FROM partido p
            LEFT JOIN grupo g ON g.id_grupo = p.id_grupo
            JOIN equipo el ON el.id_equipo = p.id_equipo_local
            JOIN equipo ev ON ev.id_equipo = p.id_equipo_visitante
            LEFT JOIN sede s ON s.id_sede = p.id_sede
            WHERE p.id_evento_deporte = ?
            ORDER BY p.fecha_hora, g.nombre, p.id_partido
            """, idEventoDeporte);
    }

    @Transactional
    public List<Map<String, Object>> generar(Long idEventoDeporte, LocalDateTime fechaInicio,
                                             int intervaloMinutos, List<Long> sedeIds) {
        if (fechaInicio == null) {
            throw new IllegalArgumentException("Selecciona fecha y hora de inicio.");
        }
        if (intervaloMinutos < 30 || intervaloMinutos > 480) {
            throw new IllegalArgumentException("El intervalo debe estar entre 30 y 480 minutos.");
        }

        List<Long> sedes = sedeIds == null ? new ArrayList<>() : new ArrayList<>(sedeIds);
        if (sedes.isEmpty()) {
            sedes = jdbc.query("SELECT id_sede FROM sede WHERE activo = 1 ORDER BY id_sede",
                (rs, rowNum) -> rs.getLong("id_sede"));
        }
        if (sedes.isEmpty()) {
            throw new IllegalArgumentException("Registra al menos una sede activa.");
        }

        List<Map<String, Object>> grupos = jdbc.queryForList("""
            SELECT id_grupo AS idGrupo, nombre
            FROM grupo
            WHERE id_evento_deporte = ?
            ORDER BY nombre
            """, idEventoDeporte);

        if (grupos.isEmpty()) {
            throw new IllegalArgumentException("Primero debes realizar el sorteo.");
        }

        jdbc.update("DELETE FROM partido WHERE id_evento_deporte = ?", idEventoDeporte);

        int turno = 0;
        for (Map<String, Object> grupo : grupos) {
            Long idGrupo = ((Number) grupo.get("idGrupo")).longValue();
            List<Long> equipos = jdbc.query("""
                SELECT id_equipo
                FROM grupo_equipo
                WHERE id_grupo = ?
                ORDER BY id_grupo_equipo
                """, (rs, rowNum) -> rs.getLong("id_equipo"), idGrupo);

            for (int i = 0; i < equipos.size(); i++) {
                for (int j = i + 1; j < equipos.size(); j++) {
                    Long idSede = sedes.get(turno % sedes.size());
                    LocalDateTime fechaHora = fechaInicio.plusMinutes(turno * (long) intervaloMinutos);

                    jdbc.update("""
                        INSERT INTO partido(id_evento_deporte, id_grupo, id_equipo_local,
                                            id_equipo_visitante, id_sede, fecha_hora, fase, estado)
                        VALUES (?, ?, ?, ?, ?, ?, 'GRUPO', 'PROGRAMADO')
                        """, idEventoDeporte, idGrupo, equipos.get(i), equipos.get(j),
                        idSede, Timestamp.valueOf(fechaHora));
                    turno++;
                }
            }
        }

        if (turno == 0) {
            throw new IllegalArgumentException("Los grupos deben tener al menos 2 equipos.");
        }

        return listar(idEventoDeporte);
    }
}
