package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.service.institucionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instituciones")
@CrossOrigin(origins = "http://localhost:5173")
public class institucionController {

    private final institucionService service;

    public institucionController(institucionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Map<String, Object> obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> crear(
            @RequestParam("nombre") String nombre,
            @RequestParam(value = "direccion", required = false) String direccion,
            @RequestParam(value = "telefono", required = false) String telefono,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "logo", required = false) MultipartFile logo) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crear(nombre, direccion, telefono, email, logo));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public Map<String, Object> actualizar(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam(value = "direccion", required = false) String direccion,
            @RequestParam(value = "telefono", required = false) String telefono,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "logo", required = false) MultipartFile logo) throws IOException {
        return service.actualizar(id, nombre, direccion, telefono, email, logo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
