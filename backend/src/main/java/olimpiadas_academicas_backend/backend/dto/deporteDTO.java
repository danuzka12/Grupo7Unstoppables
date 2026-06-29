package olimpiadas_academicas_backend.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class deporteDTO {
    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    private String tipo; // INDIVIDUAL / GRUPAL

    private Integer maxJugadores;

    private Integer minJugadores;

    private List<Long> categoriaIds;
}