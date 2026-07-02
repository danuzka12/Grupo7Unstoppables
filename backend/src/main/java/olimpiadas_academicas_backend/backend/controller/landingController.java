package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.service.landingService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/landing")
@CrossOrigin(origins = "http://localhost:5173")
public class landingController {

    private final landingService service;

    public landingController(landingService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        return service.resumen();
    }

    @GetMapping("/eventos")
    public List<Map<String, Object>> proximosEventos() {
        return service.proximosEventos();
    }

    @GetMapping("/resultados")
    public List<Map<String, Object>> ultimosResultados() {
        return service.ultimosResultados();
    }

    @GetMapping("/posiciones")
    public List<Map<String, Object>> tablaPosiciones() {
        return service.tablaPosicionesGeneral();
    }

    @GetMapping("/disciplinas")
    public List<Map<String, Object>> disciplinas() {
        return service.disciplinas();
    }
}
