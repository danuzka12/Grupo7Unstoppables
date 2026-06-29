package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.participanteDTO;
import olimpiadas_academicas_backend.backend.model.equipo;
import olimpiadas_academicas_backend.backend.model.equipoParticipante;
import olimpiadas_academicas_backend.backend.model.institucion;
import olimpiadas_academicas_backend.backend.model.participante;
import olimpiadas_academicas_backend.backend.repository.equipoParticipanteRepository;
import olimpiadas_academicas_backend.backend.repository.equipoRepository;
import olimpiadas_academicas_backend.backend.repository.institucionRepository;
import olimpiadas_academicas_backend.backend.repository.participanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class participanteService {

    private final participanteRepository participanteRepo;
    private final institucionRepository institucionRepo;
    private final equipoRepository equipoRepo;
    private final equipoParticipanteRepository equipoParticipanteRepo;

    public participanteService(participanteRepository participanteRepo,
            institucionRepository institucionRepo,
            equipoRepository equipoRepo,
            equipoParticipanteRepository equipoParticipanteRepo) {
        this.participanteRepo = participanteRepo;
        this.institucionRepo = institucionRepo;
        this.equipoRepo = equipoRepo;
        this.equipoParticipanteRepo = equipoParticipanteRepo;
    }

    // ── LISTAR ──────────────────────────────────────────────
    public List<Map<String, Object>> listar() {
        return participanteRepo.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> listarPorEquipo(Long idEquipo) {
        return equipoParticipanteRepo.findByEquipo_IdEquipo(idEquipo)
                .stream().map(this::toMapInscripcion).collect(Collectors.toList());
    }

    public Map<String, Object> obtener(Long id) {
        return toMap(buscarOFallar(id));
    }

    // ── CREAR ───────────────────────────────────────────────
    @Transactional
    public Map<String, Object> crear(participanteDTO dto) {
        if (participanteRepo.existsByDni(dto.getDni().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un participante con el DNI: " + dto.getDni());
        }

        participante p = new participante();
        aplicarCampos(p, dto);
        p = participanteRepo.save(p);

        if (dto.getIdEquipo() != null) {
            inscribirEnEquipo(p, dto.getIdEquipo(), Boolean.TRUE.equals(dto.getEsCapitan()));
        }

        return toMap(p);
    }

    // ── ACTUALIZAR ──────────────────────────────────────────
    @Transactional
    public Map<String, Object> actualizar(Long id, participanteDTO dto) {
        participante p = buscarOFallar(id);

        if (participanteRepo.existsByDniAndIdParticipanteNot(dto.getDni().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe otro participante con el DNI: " + dto.getDni());
        }

        aplicarCampos(p, dto);
        p = participanteRepo.save(p);

        if (dto.getIdEquipo() != null) {
            inscribirEnEquipo(p, dto.getIdEquipo(), Boolean.TRUE.equals(dto.getEsCapitan()));
        }

        return toMap(p);
    }

    // ── ELIMINAR ────────────────────────────────────────────
    @Transactional
    public void eliminar(Long id) {
        buscarOFallar(id);
        participanteRepo.deleteById(id);
    }

    // ── INSCRIBIR / QUITAR DE EQUIPO ────────────────────────
    @Transactional
    public Map<String, Object> inscribirEnEquipoApi(Long idParticipante, Long idEquipo, boolean esCapitan) {
        participante p = buscarOFallar(idParticipante);
        equipoParticipante ep = inscribirEnEquipo(p, idEquipo, esCapitan);
        return toMapInscripcion(ep);
    }

    @Transactional
    public void quitarDeEquipo(Long idParticipante, Long idEquipo) {
        equipoParticipante ep = equipoParticipanteRepo
                .findByEquipo_IdEquipoAndParticipante_IdParticipante(idEquipo, idParticipante)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El participante no está inscrito en ese equipo"));
        equipoParticipanteRepo.delete(ep);
    }

    // ── PRIVADOS ────────────────────────────────────────────
    private equipoParticipante inscribirEnEquipo(participante p, Long idEquipo, boolean esCapitan) {
        equipo eq = equipoRepo.findById(idEquipo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equipo no encontrado: " + idEquipo));

        equipoParticipante existente = equipoParticipanteRepo
                .findByEquipo_IdEquipoAndParticipante_IdParticipante(idEquipo, p.getIdParticipante())
                .orElse(null);

        if (existente == null) {
            // Validar cupo máximo del deporte antes de agregar uno nuevo
            Integer maxJugadores = eq.getEventoDeporte() != null && eq.getEventoDeporte().getDeporte() != null
                    ? eq.getEventoDeporte().getDeporte().getMaxJugadores()
                    : null;

            if (maxJugadores != null) {
                long actuales = equipoParticipanteRepo.countByEquipo_IdEquipo(idEquipo);
                if (actuales >= maxJugadores) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "El equipo ya alcanzó el cupo máximo de jugadores (" + maxJugadores + ")");
                }
            }

            existente = new equipoParticipante();
            existente.setEquipo(eq);
            existente.setParticipante(p);
        }

        existente.setEsCapitan(esCapitan);
        return equipoParticipanteRepo.save(existente);
    }

    private void aplicarCampos(participante p, participanteDTO dto) {
        p.setNombres(dto.getNombres().trim());
        p.setApellidos(dto.getApellidos().trim());
        p.setDni(dto.getDni().trim());
        p.setEmail(dto.getEmail());
        p.setTelefono(dto.getTelefono());

        institucion inst = institucionRepo.findById(dto.getIdInstitucion())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institución no encontrada: " + dto.getIdInstitucion()));
        p.setInstitucion(inst);
    }

    private participante buscarOFallar(Long id) {
        return participanteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Participante no encontrado: " + id));
    }

    private Map<String, Object> toMap(participante p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idParticipante", p.getIdParticipante());
        m.put("nombres", p.getNombres());
        m.put("apellidos", p.getApellidos());
        m.put("dni", p.getDni());
        m.put("email", p.getEmail());
        m.put("telefono", p.getTelefono());
        if (p.getInstitucion() != null) {
            m.put("idInstitucion", p.getInstitucion().getIdInstitucion());
            m.put("nombreInstitucion", p.getInstitucion().getNombre());
        }

        // Equipos en los que está inscrito (puede estar en varios si participa en
        // varias disciplinas/eventos)
        List<Map<String, Object>> equipos = equipoParticipanteRepo.findAll().stream()
                .filter(ep -> ep.getParticipante().getIdParticipante().equals(p.getIdParticipante()))
                .map(ep -> {
                    Map<String, Object> eqInfo = new LinkedHashMap<>();
                    equipo eq = ep.getEquipo();
                    eqInfo.put("idEquipo", eq.getIdEquipo());
                    eqInfo.put("nombreEquipo", eq.getNombre());
                    eqInfo.put("esCapitan", Boolean.TRUE.equals(ep.getEsCapitan()));
                    if (eq.getEventoDeporte() != null) {
                        eqInfo.put("nombreDeporte", eq.getEventoDeporte().getDeporte().getNombre());
                        eqInfo.put("nombreCategoria", eq.getEventoDeporte().getCategoria() != null
                                ? eq.getEventoDeporte().getCategoria().getNombre()
                                : null);
                    }
                    return eqInfo;
                }).collect(Collectors.toList());
        m.put("equipos", equipos);
        return m;
    }

    private Map<String, Object> toMapInscripcion(equipoParticipante ep) {
        Map<String, Object> m = new LinkedHashMap<>();
        participante p = ep.getParticipante();
        equipo eq = ep.getEquipo();

        m.put("idEquipoParticipante", ep.getIdEquipoParticipante());
        m.put("esCapitan", Boolean.TRUE.equals(ep.getEsCapitan()));

        m.put("idParticipante", p.getIdParticipante());
        m.put("nombres", p.getNombres());
        m.put("apellidos", p.getApellidos());
        m.put("dni", p.getDni());
        m.put("email", p.getEmail());
        m.put("telefono", p.getTelefono());
        if (p.getInstitucion() != null) {
            m.put("idInstitucion", p.getInstitucion().getIdInstitucion());
            m.put("nombreInstitucion", p.getInstitucion().getNombre());
        }

        m.put("idEquipo", eq.getIdEquipo());
        m.put("nombreEquipo", eq.getNombre());
        if (eq.getEventoDeporte() != null) {
            m.put("nombreDeporte", eq.getEventoDeporte().getDeporte().getNombre());
            m.put("nombreCategoria", eq.getEventoDeporte().getCategoria() != null
                    ? eq.getEventoDeporte().getCategoria().getNombre()
                    : null);
            if (eq.getEventoDeporte().getEvento() != null) {
                m.put("idEvento", eq.getEventoDeporte().getEvento().getIdEvento());
                m.put("nombreEvento", eq.getEventoDeporte().getEvento().getNombre());
            }
        }
        return m;
    }
}
