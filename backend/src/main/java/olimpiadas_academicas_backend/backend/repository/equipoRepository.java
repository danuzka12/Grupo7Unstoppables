package olimpiadas_academicas_backend.backend.repository;

import olimpiadas_academicas_backend.backend.model.equipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface equipoRepository extends JpaRepository<equipo, Long> {
    List<equipo> findByEventoDeporte_IdEventoDeporte(Long idEventoDeporte);

    List<equipo> findByEventoDeporte_Evento_IdEvento(Long idEvento);
}
