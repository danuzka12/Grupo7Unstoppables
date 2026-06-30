package olimpiadas_academicas_backend.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class sorteoService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public sorteoService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> listarEquipos(Long idEventoDeporte) {
        return jdbc.queryForList("""
            SELECT id_equipo AS idEquipo, nombre, color_uniforme AS colorUniforme,
                   estado_inscripcion AS estadoInscripcion
            FROM equipo
            WHERE id_evento_deporte = ?
            ORDER BY nombre
            """, idEventoDeporte);
    }

    public List<Map<String, Object>> listarGrupos(Long idEventoDeporte) {
        List<Map<String, Object>> filas = jdbc.queryForList("""
            SELECT g.id_grupo AS idGrupo, g.nombre AS grupo,
                   eq.id_equipo AS idEquipo, eq.nombre AS equipo,
                   eq.color_uniforme AS colorUniforme
            FROM grupo g
            LEFT JOIN grupo_equipo ge ON ge.id_grupo = g.id_grupo
            LEFT JOIN equipo eq ON eq.id_equipo = ge.id_equipo
            WHERE g.id_evento_deporte = ?
            ORDER BY g.nombre, ge.id_grupo_equipo
            """, idEventoDeporte);

        Map<Long, Map<String, Object>> grupos = new LinkedHashMap<>();
        for (Map<String, Object> fila : filas) {
            Long idGrupo = ((Number) fila.get("idGrupo")).longValue();
            Map<String, Object> grupo = grupos.computeIfAbsent(idGrupo, id -> {
                Map<String, Object> nuevo = new LinkedHashMap<>();
                nuevo.put("idGrupo", id);
                nuevo.put("nombre", fila.get("grupo"));
                nuevo.put("equipos", new ArrayList<Map<String, Object>>());
                return nuevo;
            });

            if (fila.get("idEquipo") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> equipos = (List<Map<String, Object>>) grupo.get("equipos");
                equipos.add(Map.of(
                    "idEquipo", fila.get("idEquipo"),
                    "nombre", fila.get("equipo"),
                    "colorUniforme", fila.get("colorUniforme") == null ? "" : fila.get("colorUniforme")
                ));
            }
        }

        return new ArrayList<>(grupos.values());
    }

    @Transactional
    public List<Map<String, Object>> realizarSorteo(Long idEventoDeporte, int cantidadGrupos) {
        List<Map<String, Object>> equipos = jdbc.queryForList("""
            SELECT id_equipo AS idEquipo, nombre
            FROM equipo
            WHERE id_evento_deporte = ? AND estado_inscripcion = 'APROBADO'
            """, idEventoDeporte);

        if (equipos.size() < 2) {
            throw new IllegalArgumentException("Se necesitan al menos 2 equipos aprobados para sortear.");
        }

        int maxGrupos = Math.max(1, equipos.size() / 2);
        if (cantidadGrupos < 1 || cantidadGrupos > maxGrupos) {
            throw new IllegalArgumentException("La cantidad de grupos debe estar entre 1 y " + maxGrupos + ".");
        }

        jdbc.update("DELETE FROM partido WHERE id_evento_deporte = ?", idEventoDeporte);
        jdbc.update("""
            DELETE ge FROM grupo_equipo ge
            JOIN grupo g ON g.id_grupo = ge.id_grupo
            WHERE g.id_evento_deporte = ?
            """, idEventoDeporte);
        jdbc.update("DELETE FROM grupo WHERE id_evento_deporte = ?", idEventoDeporte);

        List<Long> idsGrupos = new ArrayList<>();
        for (int i = 0; i < cantidadGrupos; i++) {
            String nombreGrupo = String.valueOf((char) ('A' + i));
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO grupo(id_evento_deporte, nombre) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
                );
                ps.setLong(1, idEventoDeporte);
                ps.setString(2, nombreGrupo);
                return ps;
            }, keyHolder);
            idsGrupos.add(keyHolder.getKey().longValue());
        }

        Collections.shuffle(equipos);
        for (int i = 0; i < equipos.size(); i++) {
            Long idEquipo = ((Number) equipos.get(i).get("idEquipo")).longValue();
            Long idGrupo = idsGrupos.get(i % idsGrupos.size());
            jdbc.update("INSERT INTO grupo_equipo(id_grupo, id_equipo) VALUES (?, ?)", idGrupo, idEquipo);
        }

        guardarAuditoria(idEventoDeporte);
        return listarGrupos(idEventoDeporte);
    }

    private void guardarAuditoria(Long idEventoDeporte) {
        List<Long> usuarios = jdbc.query("SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1",
            (rs, rowNum) -> rs.getLong("id_usuario"));
        Long idUsuario = usuarios.isEmpty() ? null : usuarios.get(0);

        try {
            jdbc.update("""
                INSERT INTO sorteo_log(id_evento_deporte, id_usuario, resultado_json, observaciones)
                VALUES (?, ?, ?, ?)
                """, idEventoDeporte, idUsuario,
                objectMapper.writeValueAsString(listarGrupos(idEventoDeporte)),
                "Sorteo realizado desde el módulo web");
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo registrar el resultado del sorteo.", e);
        }
    }
}
