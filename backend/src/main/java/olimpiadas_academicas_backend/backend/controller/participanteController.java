package olimpiadas_academicas_backend.backend.controller;

import jakarta.validation.Valid;
import olimpiadas_academicas_backend.backend.dto.participanteDTO;
import olimpiadas_academicas_backend.backend.service.participanteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participantes")
@CrossOrigin(origins = "http://localhost:5173")
public class participanteController {

    private final participanteService service;

    public participanteController(participanteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.listar();
    }

    @GetMapping("/equipo/{idEquipo}")
    public List<Map<String, Object>> listarPorEquipo(@PathVariable Long idEquipo) {
        return service.listarPorEquipo(idEquipo);
    }

    @GetMapping("/{id}")
    public Map<String, Object> obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@Valid @RequestBody participanteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(dto));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable Long id,
            @Valid @RequestBody participanteDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    // ── Inscribir / quitar de un equipo (sin tocar los datos personales) ──
    @PostMapping("/{idParticipante}/equipos/{idEquipo}")
    public Map<String, Object> inscribirEnEquipo(@PathVariable Long idParticipante,
            @PathVariable Long idEquipo,
            @RequestParam(defaultValue = "false") boolean esCapitan) {
        return service.inscribirEnEquipoApi(idParticipante, idEquipo, esCapitan);
    }

    @DeleteMapping("/{idParticipante}/equipos/{idEquipo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void quitarDeEquipo(@PathVariable Long idParticipante, @PathVariable Long idEquipo) {
        service.quitarDeEquipo(idParticipante, idEquipo);
    }
}
