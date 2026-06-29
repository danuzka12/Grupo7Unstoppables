package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "evento_deporte")
@Getter
@Setter
public class eventoDeporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento_deporte")
    private Long idEventoDeporte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento")
    private evento evento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_deporte")
    private deporte deporte;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria")
    private categoria categoria;
}
