package olimpiadas_academicas_backend.backend.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import olimpiadas_academicas_backend.backend.dto.categoriaDTO;
import olimpiadas_academicas_backend.backend.dto.deporteDTO;
import olimpiadas_academicas_backend.backend.model.categoria;
import olimpiadas_academicas_backend.backend.model.deporte;
import olimpiadas_academicas_backend.backend.model.deporteCategoria;
import olimpiadas_academicas_backend.backend.model.enums.EstadoDeporte;
import olimpiadas_academicas_backend.backend.model.enums.TipoDeporte;
import olimpiadas_academicas_backend.backend.repository.categoriaRepository;
import olimpiadas_academicas_backend.backend.repository.deporteCategoriaRepository;
import olimpiadas_academicas_backend.backend.repository.deporteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class deporteService {

    private final deporteRepository deporteRepo;
    private final categoriaRepository categoriaRepo;
    private final deporteCategoriaRepository deporteCatRepo;

    @PersistenceContext
    private EntityManager em;

    public deporteService(deporteRepository deporteRepo,
            categoriaRepository categoriaRepo,
            deporteCategoriaRepository deporteCatRepo) {
        this.deporteRepo = deporteRepo;
        this.categoriaRepo = categoriaRepo;
        this.deporteCatRepo = deporteCatRepo;
    }

    public List<Map<String, Object>> listar() {
        return deporteRepo.findAll().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> obtener(Long id) {
        return toMap(buscarOFallar(id));
    }

    @Transactional
    public Map<String, Object> crear(deporteDTO dto) {
        if (deporteRepo.findByNombreIgnoreCase(dto.getNombre()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un deporte con ese nombre");
        }
        deporte d = new deporte();
        d.setNombre(dto.getNombre().trim());
        d.setDescripcion(dto.getDescripcion());
        d.setTipo(parseTipo(dto.getTipo()));
        d.setMinJugadores(dto.getMinJugadores());
        d.setMaxJugadores(dto.getMaxJugadores());
        d.setEstado(EstadoDeporte.ACTIVO);
        d.setCreatedAt(LocalDateTime.now());
        d.setUpdatedAt(LocalDateTime.now());
        deporte guardado = deporteRepo.save(d);

        if (dto.getCategoriaIds() != null) {
            for (Long catId : dto.getCategoriaIds()) {
                categoria cat = categoriaRepo.findById(catId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Categoría no encontrada: " + catId));
                deporteCategoria dc = new deporteCategoria();
                dc.setDeporte(guardado);
                dc.setCategoria(cat);
                deporteCatRepo.save(dc);
            }
        }
        return toMap(guardado);
    }

    @Transactional
    public Map<String, Object> actualizar(Long id, deporteDTO dto) {

        System.out.println("Categorias recibidas: " + dto.getCategoriaIds());

        deporte d = buscarOFallar(id);

        if (deporteRepo.existsByNombreIgnoreCaseAndIdDeporteNot(dto.getNombre(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe otro deporte con ese nombre");
        }

        d.setNombre(dto.getNombre().trim());
        d.setDescripcion(dto.getDescripcion());
        d.setTipo(parseTipo(dto.getTipo()));
        d.setMinJugadores(dto.getMinJugadores());
        d.setMaxJugadores(dto.getMaxJugadores());
        d.setUpdatedAt(LocalDateTime.now());
        deporteRepo.save(d);
        em.flush();
        em.clear(); // limpia el caché ANTES del delete nativo

        // DELETE nativo después de limpiar el caché
        em.createNativeQuery("DELETE FROM deporte_categoria WHERE id_deporte = :id")
                .setParameter("id", id)
                .executeUpdate();
        em.flush();

        // Insertar nuevas categorías
        if (dto.getCategoriaIds() != null && !dto.getCategoriaIds().isEmpty()) {
            for (Long catId : dto.getCategoriaIds()) {
                em.createNativeQuery(
                        "INSERT INTO deporte_categoria (id_deporte, id_categoria) VALUES (:dep, :cat)")
                        .setParameter("dep", id)
                        .setParameter("cat", catId)
                        .executeUpdate();
            }
        }
        em.flush();

        // Recargar el deporte desde BD limpia
        deporte actualizado = deporteRepo.findById(id).orElseThrow();
        return toMap(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        buscarOFallar(id);
        em.createNativeQuery("DELETE FROM deporte_categoria WHERE id_deporte = :id")
                .setParameter("id", id)
                .executeUpdate();
        em.flush();
        deporteRepo.deleteById(id);
    }

    private deporte buscarOFallar(Long id) {
        return deporteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deporte no encontrado: " + id));
    }

    private TipoDeporte parseTipo(String tipo) {
        try {
            return TipoDeporte.valueOf(tipo.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo inválido. Use INDIVIDUAL o GRUPAL");
        }
    }

    private Map<String, Object> toMap(deporte d) {
        List<categoriaDTO> cats = deporteCatRepo
                .findByDeporte_IdDeporte(d.getIdDeporte())
                .stream()
                .map(dc -> {
                    categoriaDTO c = new categoriaDTO();
                    c.setIdCategoria(dc.getCategoria().getIdCategoria());
                    c.setNombre(dc.getCategoria().getNombre());
                    c.setDescripcion(dc.getCategoria().getDescripcion());
                    return c;
                })
                .collect(Collectors.toList());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idDeporte", d.getIdDeporte());
        m.put("nombre", d.getNombre());
        m.put("descripcion", d.getDescripcion());
        m.put("tipo", d.getTipo() != null ? d.getTipo().name() : null);
        m.put("minJugadores", d.getMinJugadores());
        m.put("maxJugadores", d.getMaxJugadores());
        m.put("estado", d.getEstado() != null ? d.getEstado().name() : null);
        m.put("categorias", cats);
        return m;
    }
}