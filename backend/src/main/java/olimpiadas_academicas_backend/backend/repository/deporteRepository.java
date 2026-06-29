package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.deporte;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface deporteRepository extends JpaRepository<deporte, Long> {
    Optional<deporte> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdDeporteNot(String nombre, Long idDeporte);
}
