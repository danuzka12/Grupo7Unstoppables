package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.service.sorteoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sorteos")
@CrossOrigin(origins = "http://localhost:5173")
public class sorteoController {

    private final sorteoService service;

    public sorteoController(sorteoService service) {
        this.service = service;
    }

    @GetMapping("/{idEventoDeporte}/equipos")
    public List<Map<String, Object>> equipos(@PathVariable Long idEventoDeporte) {
        return service.listarEquipos(idEventoDeporte);
    }

    @GetMapping("/{idEventoDeporte}/grupos")
    public List<Map<String, Object>> grupos(@PathVariable Long idEventoDeporte) {
        return service.listarGrupos(idEventoDeporte);
    }

    @PostMapping("/{idEventoDeporte}")
    public ResponseEntity<?> sortear(@PathVariable Long idEventoDeporte,
                                     @RequestBody SorteoRequest request) {
        try {
            return ResponseEntity.ok(service.realizarSorteo(idEventoDeporte, request.cantidadGrupos()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    public record SorteoRequest(int cantidadGrupos) {}
}
