package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.service.competenciaService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competencias")
@CrossOrigin(origins = "http://localhost:5173")
public class competenciaController {

    private final competenciaService service;

    public competenciaController(competenciaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.listar();
    }
}
