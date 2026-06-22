package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import olimpiadas_academicas_backend.backend.model.enums.EstadoEvento;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evento")
@Getter
@Setter
public class evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEvento;

    @Column(name = "id_institucion")
    private Long idInstitucion;

    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalDate fechaLimiteInsc;

    private String premio;

    private Integer minEquipos;

    @Enumerated(EnumType.STRING)
    private EstadoEvento estado;

    @Column(name = "id_usuario_creador")
    private Long idUsuarioCreador;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}