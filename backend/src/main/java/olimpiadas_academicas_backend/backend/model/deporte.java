package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import olimpiadas_academicas_backend.backend.model.enums.EstadoDeporte;
import olimpiadas_academicas_backend.backend.model.enums.TipoDeporte;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "deporte")
@Getter
@Setter

public class deporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_deporte")
    private Long idDeporte;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDeporte tipo;

    @Column(name = "max_jugadores")
    private Integer maxJugadores;

    @Column(name = "min_jugadores")
    private Integer minJugadores;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoDeporte estado = EstadoDeporte.ACTIVO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
