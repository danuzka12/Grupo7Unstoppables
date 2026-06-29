package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.deporteCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface deporteCategoriaRepository extends JpaRepository<deporteCategoria, Long> {

    List<deporteCategoria> findByDeporte_IdDeporte(Long idDeporte);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM deporte_categoria WHERE id_deporte = :idDeporte", nativeQuery = true)
    void deleteByDeporte_IdDeporte(@Param("idDeporte") Long idDeporte);
}
