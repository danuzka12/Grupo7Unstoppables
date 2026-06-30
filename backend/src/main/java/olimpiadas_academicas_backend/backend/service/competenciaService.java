package olimpiadas_academicas_backend.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class competenciaService {

    private final JdbcTemplate jdbc;

    public competenciaService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listar() {
        return jdbc.queryForList("""
            SELECT
                ed.id_evento_deporte AS idEventoDeporte,
                e.id_evento AS idEvento,
                e.nombre AS evento,
                d.id_deporte AS idDeporte,
                d.nombre AS deporte,
                c.id_categoria AS idCategoria,
                c.nombre AS categoria,
                COUNT(DISTINCT eq.id_equipo) AS equipos,
                COUNT(DISTINCT g.id_grupo) AS grupos,
                COUNT(DISTINCT p.id_partido) AS partidos
            FROM evento_deporte ed
            JOIN evento e ON e.id_evento = ed.id_evento
            JOIN deporte d ON d.id_deporte = ed.id_deporte
            JOIN categoria c ON c.id_categoria = ed.id_categoria
            LEFT JOIN equipo eq ON eq.id_evento_deporte = ed.id_evento_deporte
                AND eq.estado_inscripcion = 'APROBADO'
            LEFT JOIN grupo g ON g.id_evento_deporte = ed.id_evento_deporte
            LEFT JOIN partido p ON p.id_evento_deporte = ed.id_evento_deporte
            GROUP BY ed.id_evento_deporte, e.id_evento, e.nombre,
                     d.id_deporte, d.nombre, c.id_categoria, c.nombre
            ORDER BY e.id_evento DESC, d.nombre, c.nombre
            """);
    }
}
