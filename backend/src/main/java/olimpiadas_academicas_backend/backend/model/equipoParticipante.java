package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "equipo_participante", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "id_equipo", "id_participante" })
})
@Getter
@Setter
public class equipoParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo_participante")
    private Long idEquipoParticipante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_equipo")
    private equipo equipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_participante")
    private participante participante;

    @Column(name = "es_capitan")
    private Boolean esCapitan = false;
}
