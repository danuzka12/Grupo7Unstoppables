package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class equipoDTO {

    @NotBlank
    private String nombre;

    @NotNull
    private Long idEventoDeporte;

    @NotNull
    private Long idInstitucion;

    private String colorUniforme;
    private String estadoInscripcion;
}
