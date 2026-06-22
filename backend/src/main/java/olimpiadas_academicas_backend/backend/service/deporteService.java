package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.deporteDTO;
import olimpiadas_academicas_backend.backend.model.deporte;
import olimpiadas_academicas_backend.backend.model.enums.TipoDeporte;
import olimpiadas_academicas_backend.backend.repository.deporteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class deporteService {
    private final deporteRepository repository;

    public deporteService(deporteRepository repository) {
        this.repository = repository;
    }

    // LISTAR
    public List<deporte> listar() {
        return repository.findAll();
    }

    // CREAR
    public deporte crear(deporteDTO dto) {

        deporte d = new deporte();

        d.setNombre(dto.getNombre());
        d.setDescripcion(dto.getDescripcion());

        d.setTipo(TipoDeporte.valueOf(dto.getTipo()));

        d.setMaxJugadores(dto.getMaxJugadores());
        d.setMinJugadores(dto.getMinJugadores());

        d.setCreatedAt(LocalDateTime.now());
        d.setUpdatedAt(LocalDateTime.now());

        return repository.save(d);
    }

    // ACTUALIZAR
    public deporte actualizar(Long id, deporteDTO request) {

        deporte d = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe deporte"));

        d.setNombre(request.getNombre());
        d.setDescripcion(request.getDescripcion());

        d.setTipo(TipoDeporte.valueOf(request.getTipo()));

        d.setMaxJugadores(request.getMaxJugadores());
        d.setMinJugadores(request.getMinJugadores());

        d.setUpdatedAt(LocalDateTime.now());

        return repository.save(d);
    }

    // ELIMINAR
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}