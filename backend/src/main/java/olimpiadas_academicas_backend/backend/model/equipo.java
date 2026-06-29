package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import olimpiadas_academicas_backend.backend.model.enums.EstadoInscripcion;

@Entity
@Table(name = "equipo")
@Getter
@Setter
public class equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long idEquipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_evento_deporte")
    private eventoDeporte eventoDeporte;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_institucion")
    private institucion institucion;

    @Column(length = 100)
    private String nombre;

    @Column(name = "color_uniforme", length = 50)
    private String colorUniforme;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_inscripcion")
    private EstadoInscripcion estadoInscripcion = EstadoInscripcion.PENDIENTE;
}
