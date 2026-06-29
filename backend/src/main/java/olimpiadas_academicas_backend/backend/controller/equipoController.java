package olimpiadas_academicas_backend.backend.controller;

import jakarta.validation.Valid;
import olimpiadas_academicas_backend.backend.dto.equipoDTO;
import olimpiadas_academicas_backend.backend.service.equipoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "http://localhost:5173")
public class equipoController {

    private final equipoService service;

    public equipoController(equipoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.listar();
    }

    @GetMapping("/evento/{idEvento}")
    public List<Map<String, Object>> listarPorEvento(@PathVariable Long idEvento) {
        return service.listarPorEvento(idEvento);
    }

    @GetMapping("/{id}")
    public Map<String, Object> obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@Valid @RequestBody equipoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(dto));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable Long id,
            @Valid @RequestBody equipoDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
