package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.equipoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface equipoParticipanteRepository extends JpaRepository<equipoParticipante, Long> {

    List<equipoParticipante> findByEquipo_IdEquipo(Long idEquipo);

    long countByEquipo_IdEquipo(Long idEquipo);

    Optional<equipoParticipante> findByEquipo_IdEquipoAndParticipante_IdParticipante(Long idEquipo,
            Long idParticipante);

    boolean existsByEquipo_IdEquipoAndParticipante_IdParticipante(Long idEquipo, Long idParticipante);
}
