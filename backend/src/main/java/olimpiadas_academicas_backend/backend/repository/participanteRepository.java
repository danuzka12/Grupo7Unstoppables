package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.participante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface participanteRepository extends JpaRepository<participante, Long> {
    Optional<participante> findByDni(String dni);

    boolean existsByDni(String dni);

    boolean existsByDniAndIdParticipanteNot(String dni, Long idParticipante);
}
