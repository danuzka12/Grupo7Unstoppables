package olimpiadas_academicas_backend.backend.controller;

import jakarta.validation.Valid;
import olimpiadas_academicas_backend.backend.dto.eventoDTO;
import olimpiadas_academicas_backend.backend.model.evento;
import olimpiadas_academicas_backend.backend.service.eventoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "http://localhost:5173")
public class eventoController {
    private final eventoService service;

    public eventoController(eventoService service) {
        this.service = service;
    }

    @GetMapping
    public List<evento> listar() {
        return service.listar();
    }

    @PostMapping
    public evento crear(@Valid @RequestBody eventoDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public evento actualizar(@PathVariable Long id, @RequestBody eventoDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}