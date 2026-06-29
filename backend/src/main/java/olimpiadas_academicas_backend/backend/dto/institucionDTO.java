package olimpiadas_academicas_backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class institucionDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String direccion;
    private String telefono;
    private String email;
    private String logoUrl;
}
