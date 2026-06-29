package olimpiadas_academicas_backend.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "deporte_categoria", uniqueConstraints = @UniqueConstraint(columnNames = { "id_deporte",
        "id_categoria" }))
@Getter
@Setter
public class deporteCategoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_deporte_categoria")
    private Long idDeporteCategoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_deporte", nullable = false)
    private deporte deporte;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria", nullable = false)
    private categoria categoria;
}
