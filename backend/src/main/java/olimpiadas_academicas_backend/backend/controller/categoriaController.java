package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.model.categoria;
import olimpiadas_academicas_backend.backend.repository.categoriaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class categoriaController {

    private final categoriaRepository repository;

    public categoriaController(categoriaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<categoria> listar() {
        return repository.findAll();
    }
}
