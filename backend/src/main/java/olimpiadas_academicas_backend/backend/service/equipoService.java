package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.equipoDTO;
import olimpiadas_academicas_backend.backend.model.equipo;
import olimpiadas_academicas_backend.backend.model.enums.EstadoInscripcion;
import olimpiadas_academicas_backend.backend.repository.equipoRepository;
import olimpiadas_academicas_backend.backend.repository.eventoDeporteRepository;
import olimpiadas_academicas_backend.backend.repository.institucionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class equipoService {

    private final equipoRepository equipoRepo;
    private final eventoDeporteRepository eventoDepRepo;
    private final institucionRepository institucionRepo;

    public equipoService(equipoRepository equipoRepo,
            eventoDeporteRepository eventoDepRepo,
            institucionRepository institucionRepo) {
        this.equipoRepo = equipoRepo;
        this.eventoDepRepo = eventoDepRepo;
        this.institucionRepo = institucionRepo;
    }

    public List<Map<String, Object>> listar() {
        return equipoRepo.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> listarPorEvento(Long idEvento) {
        return equipoRepo.findByEventoDeporte_Evento_IdEvento(idEvento)
                .stream().map(this::toMap).collect(Collectors.toList());
    }

    public Map<String, Object> obtener(Long id) {
        return toMap(buscarOFallar(id));
    }

    @Transactional
    public Map<String, Object> crear(equipoDTO dto) {
        equipo e = new equipo();
        aplicarCampos(e, dto);
        return toMap(equipoRepo.save(e));
    }

    @Transactional
    public Map<String, Object> actualizar(Long id, equipoDTO dto) {
        equipo e = buscarOFallar(id);
        aplicarCampos(e, dto);
        return toMap(equipoRepo.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        buscarOFallar(id);
        equipoRepo.deleteById(id);
    }

    private void aplicarCampos(equipo e, equipoDTO dto) {
        e.setNombre(dto.getNombre().trim());
        e.setColorUniforme(dto.getColorUniforme());

        e.setEventoDeporte(eventoDepRepo.findById(dto.getIdEventoDeporte())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Evento-deporte no encontrado: " + dto.getIdEventoDeporte())));

        e.setInstitucion(institucionRepo.findById(dto.getIdInstitucion())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institución no encontrada: " + dto.getIdInstitucion())));

        if (dto.getEstadoInscripcion() != null) {
            try {
                e.setEstadoInscripcion(EstadoInscripcion.valueOf(dto.getEstadoInscripcion().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Estado inválido: " + dto.getEstadoInscripcion());
            }
        } else {
            e.setEstadoInscripcion(EstadoInscripcion.PENDIENTE);
        }
    }

    private equipo buscarOFallar(Long id) {
        return equipoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equipo no encontrado: " + id));
    }

    private Map<String, Object> toMap(equipo e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idEquipo", e.getIdEquipo());
        m.put("nombre", e.getNombre());
        m.put("colorUniforme", e.getColorUniforme());
        m.put("estadoInscripcion", e.getEstadoInscripcion() != null ? e.getEstadoInscripcion().name() : null);
        // eventoDeporte info
        if (e.getEventoDeporte() != null) {
            m.put("idEventoDeporte", e.getEventoDeporte().getIdEventoDeporte());
            m.put("idEvento", e.getEventoDeporte().getEvento().getIdEvento());
            m.put("nombreEvento", e.getEventoDeporte().getEvento().getNombre());
            m.put("nombreDeporte", e.getEventoDeporte().getDeporte().getNombre());
            m.put("nombreCategoria", e.getEventoDeporte().getCategoria() != null
                    ? e.getEventoDeporte().getCategoria().getNombre()
                    : null);
        }
        // institucion info
        if (e.getInstitucion() != null) {
            m.put("idInstitucion", e.getInstitucion().getIdInstitucion());
            m.put("nombreInstitucion", e.getInstitucion().getNombre());
        }
        return m;
    }
}
