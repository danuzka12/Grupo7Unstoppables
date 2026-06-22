package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface eventoRepository extends JpaRepository<evento, Long> {
}
