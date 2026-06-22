package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.dto.usuarioDTO;
import olimpiadas_academicas_backend.backend.model.usuario;
import olimpiadas_academicas_backend.backend.service.usuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class usuarioController {
    private final usuarioService service;

    public usuarioController(usuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<usuario> listar() {
        return service.listar();
    }

    @PostMapping
    public usuario crear(@Valid @RequestBody usuarioDTO request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public usuario actualizar(
            @PathVariable Long id,
            @Valid @RequestBody usuarioDTO request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}