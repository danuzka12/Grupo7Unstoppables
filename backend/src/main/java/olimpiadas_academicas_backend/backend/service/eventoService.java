package olimpiadas_academicas_backend.backend.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import olimpiadas_academicas_backend.backend.dto.eventoDTO;
import olimpiadas_academicas_backend.backend.dto.eventoDeporteDTO;
import olimpiadas_academicas_backend.backend.model.*;
import olimpiadas_academicas_backend.backend.model.enums.EstadoEvento;
import olimpiadas_academicas_backend.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class eventoService {

    private final eventoRepository eventoRepo;
    private final eventoDeporteRepository eventoDepRepo;
    private final deporteRepository deporteRepo;
    private final categoriaRepository categoriaRepo;
    private final institucionRepository institucionRepo;
    private final emailService emailSvc;

    @PersistenceContext
    private EntityManager em;

    public eventoService(eventoRepository eventoRepo,
            eventoDeporteRepository eventoDepRepo,
            deporteRepository deporteRepo,
            categoriaRepository categoriaRepo,
            institucionRepository institucionRepo,
            emailService emailSvc) {
        this.eventoRepo = eventoRepo;
        this.eventoDepRepo = eventoDepRepo;
        this.deporteRepo = deporteRepo;
        this.categoriaRepo = categoriaRepo;
        this.institucionRepo = institucionRepo;
        this.emailSvc = emailSvc;
    }

    // ── LISTAR ──────────────────────────────────────────────
    public List<Map<String, Object>> listar() {
        return eventoRepo.findAll().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    // ── OBTENER ─────────────────────────────────────────────
    public Map<String, Object> obtener(Long id) {
        return toMap(buscarOFallar(id));
    }

    // ── CREAR ───────────────────────────────────────────────
    @Transactional
    public Map<String, Object> crear(eventoDTO dto) {
        evento e = new evento();
        aplicarCampos(e, dto);
        e.setCreatedAt(LocalDateTime.now());
        e.setUpdatedAt(LocalDateTime.now());
        evento guardado = eventoRepo.save(e);

        asociarDeportes(guardado, dto.getDeportes());

        enviarCorreoConfirmacion(guardado);

        return toMap(guardado);
    }

    // ── ACTUALIZAR ──────────────────────────────────────────
    @Transactional
    public Map<String, Object> actualizar(Long id, eventoDTO dto) {
        evento e = buscarOFallar(id);
        aplicarCampos(e, dto);
        e.setUpdatedAt(LocalDateTime.now());
        eventoRepo.save(e);
        em.flush();

        // Reemplazar deportes
        em.createNativeQuery("DELETE FROM evento_deporte WHERE id_evento = :id")
                .setParameter("id", id)
                .executeUpdate();
        em.flush();

        asociarDeportes(e, dto.getDeportes());
        em.flush();

        return toMap(eventoRepo.findById(id).orElseThrow());
    }

    // ── ELIMINAR ────────────────────────────────────────────
    @Transactional
    public void eliminar(Long id) {
        buscarOFallar(id);
        em.createNativeQuery("DELETE FROM evento_deporte WHERE id_evento = :id")
                .setParameter("id", id)
                .executeUpdate();
        em.flush();
        eventoRepo.deleteById(id);
    }

    // ── HELPERS ─────────────────────────────────────────────
    private evento buscarOFallar(Long id) {
        return eventoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Evento no encontrado: " + id));
    }

    private EstadoEvento parseEstado(String estado) {
        try {
            return EstadoEvento.valueOf(estado.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Estado inválido: " + estado);
        }
    }

    private void aplicarCampos(evento e, eventoDTO dto) {
        e.setNombre(dto.getNombre().trim());
        e.setDescripcion(dto.getDescripcion());
        e.setFechaInicio(dto.getFechaInicio());
        e.setFechaFin(dto.getFechaFin());
        e.setFechaLimiteInsc(dto.getFechaLimiteInsc());
        e.setPremio(dto.getPremio());
        e.setMinEquipos(dto.getMinEquipos());
        e.setEstado(parseEstado(dto.getEstado()));
        e.setIdInstitucion(dto.getIdInstitucion());
        e.setIdUsuarioCreador(dto.getIdUsuarioCreador());
    }

    private void asociarDeportes(evento ev, List<eventoDeporteDTO> deportes) {
        if (deportes == null || deportes.isEmpty())
            return;
        for (eventoDeporteDTO d : deportes) {
            deporte dep = deporteRepo.findById(d.getIdDeporte())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Deporte no encontrado: " + d.getIdDeporte()));
            categoria cat = categoriaRepo.findById(d.getIdCategoria())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Categoría no encontrada: " + d.getIdCategoria()));

            eventoDeporte ed = new eventoDeporte();
            ed.setEvento(ev);
            ed.setDeporte(dep);
            ed.setCategoria(cat);
            em.persist(ed);
        }
    }

    private void enviarCorreoConfirmacion(evento e) {
        institucion inst = institucionRepo.findById(e.getIdInstitucion()).orElse(null);
        if (inst == null || inst.getEmail() == null || inst.getEmail().isBlank()) {
            return;
        }

        String disciplinas = eventoDepRepo.findByEvento_IdEvento(e.getIdEvento()).stream()
                .map(ed -> ed.getDeporte().getNombre())
                .distinct()
                .collect(Collectors.joining(", "));

        String asunto = "Confirmación de registro de evento: " + e.getNombre();

        StringBuilder cuerpo = new StringBuilder();
        cuerpo.append("Estimados,\n\n");
        cuerpo.append("Le confirmamos que el evento \"").append(e.getNombre())
                .append("\" ha sido registrado exitosamente en el sistema de Olimpiadas Académicas.\n\n");
        cuerpo.append("Detalles del evento:\n");
        cuerpo.append("- Fecha de inicio: ").append(e.getFechaInicio()).append("\n");
        cuerpo.append("- Fecha de fin: ").append(e.getFechaFin()).append("\n");
        if (e.getPremio() != null && !e.getPremio().isBlank()) {
            cuerpo.append("- Premio: ").append(e.getPremio()).append("\n");
        }
        if (!disciplinas.isEmpty()) {
            cuerpo.append("- Disciplinas: ").append(disciplinas).append("\n");
        }
        cuerpo.append("\nSaludos cordiales,\nEquipo de Olimpiadas Académicas");

        emailSvc.enviar(inst.getEmail(), asunto, cuerpo.toString());
    }

    // Mapper entidad → Map limpio
    private Map<String, Object> toMap(evento e) {
        List<Map<String, Object>> deportes = eventoDepRepo
                .findByEvento_IdEvento(e.getIdEvento())
                .stream()
                .map(ed -> {
                    Map<String, Object> d = new LinkedHashMap<>();
                    d.put("idEventoDeporte", ed.getIdEventoDeporte());
                    d.put("idDeporte", ed.getDeporte().getIdDeporte());
                    d.put("nombreDeporte", ed.getDeporte().getNombre());
                    d.put("idCategoria", ed.getCategoria() != null ? ed.getCategoria().getIdCategoria() : null);
                    d.put("nombreCategoria", ed.getCategoria() != null ? ed.getCategoria().getNombre() : null);
                    return d;
                })
                .collect(Collectors.toList());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idEvento", e.getIdEvento());
        m.put("nombre", e.getNombre());
        m.put("descripcion", e.getDescripcion());
        m.put("fechaInicio", e.getFechaInicio());
        m.put("fechaFin", e.getFechaFin());
        m.put("fechaLimiteInsc", e.getFechaLimiteInsc());
        m.put("premio", e.getPremio());
        m.put("minEquipos", e.getMinEquipos());
        m.put("estado", e.getEstado() != null ? e.getEstado().name() : null);
        m.put("idInstitucion", e.getIdInstitucion());
        m.put("idUsuarioCreador", e.getIdUsuarioCreador());
        m.put("deportes", deportes);
        return m;
    }
}
