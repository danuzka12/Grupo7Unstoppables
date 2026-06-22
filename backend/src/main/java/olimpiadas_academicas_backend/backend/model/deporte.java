package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import olimpiadas_academicas_backend.backend.model.enums.EstadoDeporte;
import olimpiadas_academicas_backend.backend.model.enums.TipoDeporte;

import java.time.LocalDateTime;

@Entity
@Table(name = "deporte")
@Getter
@Setter
public class deporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDeporte;

    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private TipoDeporte tipo;

    private Integer maxJugadores;

    private Integer minJugadores;

    @Enumerated(EnumType.STRING)
    private EstadoDeporte estado;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
