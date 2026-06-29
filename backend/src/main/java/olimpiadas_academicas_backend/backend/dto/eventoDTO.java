package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class eventoDTO {

    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    private LocalDate fechaLimiteInsc;

    private String premio;

    private Integer minEquipos;

    @NotNull
    private String estado;

    @NotNull
    private Long idInstitucion;

    private Long idUsuarioCreador;

    // Deportes a asociar al evento
    private List<eventoDeporteDTO> deportes;
}
