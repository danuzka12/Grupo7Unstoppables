package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class resultadoDTO {

    @NotNull
    private Long idPartido;

    @NotNull
    @Min(0)
    private Integer golesLocal;

    @NotNull
    @Min(0)
    private Integer golesVisitante;

    private String observaciones;

    private Boolean publicado = false;

    @NotNull
    private Long idUsuarioRegistro;

    /**
     * Estadísticas por jugador inscrito en el partido (hardcodeado a fútbol por
     * ahora: goles).
     */
    private List<@Valid EstadisticaJugadorItem> estadisticas;

    @Getter
    @Setter
    public static class EstadisticaJugadorItem {

        @NotNull
        private Long idParticipante;

        @Min(0)
        private Integer goles = 0;
    }
}
