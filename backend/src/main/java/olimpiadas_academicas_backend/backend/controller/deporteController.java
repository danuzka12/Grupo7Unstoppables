package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.dto.deporteDTO;
import olimpiadas_academicas_backend.backend.model.deporte;
import olimpiadas_academicas_backend.backend.service.deporteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deportes")
@CrossOrigin(origins = "http://localhost:5173")
public class deporteController {
    private final deporteService service;

    public deporteController(deporteService service) {
        this.service = service;
    }

    @GetMapping
    public List<deporte> listar() {
        return service.listar();
    }

    @PostMapping
    public deporte crear(@Valid @RequestBody deporteDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public deporte actualizar(@PathVariable Long id, @RequestBody deporteDTO request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}