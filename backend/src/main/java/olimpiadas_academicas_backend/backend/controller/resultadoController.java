package olimpiadas_academicas_backend.backend.controller;

import jakarta.validation.Valid;
import olimpiadas_academicas_backend.backend.dto.resultadoDTO;
import olimpiadas_academicas_backend.backend.service.resultadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resultados")
@CrossOrigin(origins = "http://localhost:5173")
public class resultadoController {

    private final resultadoService service;

    public resultadoController(resultadoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam Long idEventoDeporte) {
        return service.listar(idEventoDeporte);
    }

    @GetMapping("/pendientes")
    public List<Map<String, Object>> pendientes(@RequestParam Long idEventoDeporte) {
        return service.pendientes(idEventoDeporte);
    }

    @GetMapping("/partido/{idPartido}/jugadores")
    public ResponseEntity<?> jugadoresDePartido(@PathVariable Long idPartido) {
        try {
            return ResponseEntity.ok(service.jugadoresDePartido(idPartido));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/partido/{idPartido}")
    public ResponseEntity<?> detallePorPartido(@PathVariable Long idPartido) {
        try {
            return ResponseEntity.ok(service.detallePorPartido(idPartido));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No se encontró un resultado para este partido."));
        }
    }

    @PostMapping
    public ResponseEntity<?> registrar(@Valid @RequestBody resultadoDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/{idResultado}/publicar")
    public ResponseEntity<?> togglePublicado(@PathVariable Long idResultado) {
        try {
            return ResponseEntity.ok(service.togglePublicado(idResultado));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "No se encontró el resultado indicado."));
        }
    }
}
