package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.eventoDeporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface eventoDeporteRepository extends JpaRepository<eventoDeporte, Long> {

    List<eventoDeporte> findByEvento_IdEvento(Long idEvento);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM evento_deporte WHERE id_evento = :idEvento", nativeQuery = true)
    void deleteByIdEvento(@Param("idEvento") Long idEvento);
}
