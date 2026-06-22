package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.eventoDTO;
import olimpiadas_academicas_backend.backend.model.evento;
import olimpiadas_academicas_backend.backend.model.enums.EstadoEvento;
import olimpiadas_academicas_backend.backend.repository.eventoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class eventoService {
    private final eventoRepository repository;

    public eventoService(eventoRepository repository) {
        this.repository = repository;
    }

    public List<evento> listar() {
        return repository.findAll();
    }

    public evento crear(eventoDTO dto) {

        evento e = new evento();

        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());

        e.setFechaInicio(dto.getFechaInicio());
        e.setFechaFin(dto.getFechaFin());
        e.setFechaLimiteInsc(dto.getFechaLimiteInsc());

        e.setPremio(dto.getPremio());
        e.setMinEquipos(dto.getMinEquipos());

        e.setEstado(EstadoEvento.valueOf(dto.getEstado()));

        e.setIdInstitucion(dto.getIdInstitucion());
        e.setIdUsuarioCreador(dto.getIdUsuarioCreador());

        e.setCreatedAt(LocalDateTime.now());
        e.setUpdatedAt(LocalDateTime.now());

        return repository.save(e);
    }

    public evento actualizar(Long id, eventoDTO dto) {

        evento e = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());

        e.setFechaInicio(dto.getFechaInicio());
        e.setFechaFin(dto.getFechaFin());
        e.setFechaLimiteInsc(dto.getFechaLimiteInsc());

        e.setPremio(dto.getPremio());
        e.setMinEquipos(dto.getMinEquipos());

        e.setEstado(EstadoEvento.valueOf(dto.getEstado()));

        e.setUpdatedAt(LocalDateTime.now());

        return repository.save(e);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}