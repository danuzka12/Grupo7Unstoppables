package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

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

    @NotNull
    private LocalDate fechaLimiteInsc;

    private String premio;

    @NotNull
    private Integer minEquipos;

    @NotNull
    private String estado;

    @NotNull
    private Long idInstitucion;

    @NotNull
    private Long idUsuarioCreador;
}
