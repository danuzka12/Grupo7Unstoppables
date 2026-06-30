package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.service.partidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "http://localhost:5173")
public class partidoController {

    private final partidoService service;

    public partidoController(partidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam Long idEventoDeporte) {
        return service.listar(idEventoDeporte);
    }

    @GetMapping("/sedes")
    public List<Map<String, Object>> sedes() {
        return service.listarSedes();
    }

    @PostMapping("/generar")
    public ResponseEntity<?> generar(@RequestBody GenerarPartidosRequest request) {
        try {
            return ResponseEntity.ok(service.generar(
                request.idEventoDeporte(),
                request.fechaInicio(),
                request.intervaloMinutos(),
                request.sedeIds()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    public record GenerarPartidosRequest(Long idEventoDeporte,
                                         LocalDateTime fechaInicio,
                                         int intervaloMinutos,
                                         List<Long> sedeIds) {}
}
