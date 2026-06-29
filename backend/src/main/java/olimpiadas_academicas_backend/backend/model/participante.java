package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "participante")
@Getter
@Setter
public class participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participante")
    private Long idParticipante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_institucion")
    private institucion institucion;

    @Column(length = 100)
    private String nombres;

    @Column(length = 100)
    private String apellidos;

    @Column(length = 20, unique = true)
    private String dni;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;
}
