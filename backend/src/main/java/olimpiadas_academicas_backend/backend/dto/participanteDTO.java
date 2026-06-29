package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class participanteDTO {

    @NotBlank
    private String nombres;

    @NotBlank
    private String apellidos;

    @NotBlank
    private String dni;

    private String email;
    private String telefono;

    @NotNull
    private Long idInstitucion;

    // Opcional: si viene, además de crear/actualizar el participante,
    // se inscribe (o actualiza su inscripción) en ese equipo.
    private Long idEquipo;
    private Boolean esCapitan;
}
