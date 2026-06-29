package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.model.institucion;
import olimpiadas_academicas_backend.backend.repository.institucionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class institucionService {

    private final institucionRepository repo;

    public institucionService(institucionRepository repo) {
        this.repo = repo;
    }

    public List<Map<String, Object>> listar() {
        return repo.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    public Map<String, Object> obtener(Long id) {
        return toMap(buscarOFallar(id));
    }

    @Transactional
    public Map<String, Object> crear(String nombre, String direccion, String telefono,
            String email, MultipartFile logo) throws IOException {
        institucion i = new institucion();
        i.setNombre(nombre.trim());
        i.setDireccion(direccion);
        i.setTelefono(telefono);
        i.setEmail(email);
        i.setActivo(true);
        i.setCreatedAt(LocalDateTime.now());
        i.setUpdatedAt(LocalDateTime.now());
        if (logo != null && !logo.isEmpty()) {
            i.setLogo(logo.getBytes());
        }
        return toMap(repo.save(i));
    }

    @Transactional
    public Map<String, Object> actualizar(Long id, String nombre, String direccion,
            String telefono, String email,
            MultipartFile logo) throws IOException {
        institucion i = buscarOFallar(id);
        i.setNombre(nombre.trim());
        i.setDireccion(direccion);
        i.setTelefono(telefono);
        i.setEmail(email);
        i.setUpdatedAt(LocalDateTime.now());
        if (logo != null && !logo.isEmpty()) {
            i.setLogo(logo.getBytes());
        }
        return toMap(repo.save(i));
    }

    @Transactional
    public void eliminar(Long id) {
        buscarOFallar(id);
        repo.deleteById(id);
    }

    private institucion buscarOFallar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institución no encontrada: " + id));
    }

    private Map<String, Object> toMap(institucion i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idInstitucion", i.getIdInstitucion());
        m.put("nombre", i.getNombre());
        m.put("direccion", i.getDireccion());
        m.put("telefono", i.getTelefono());
        m.put("email", i.getEmail());
        m.put("activo", i.getActivo());
        // Convertir bytes a base64 para que el frontend lo muestre como <img>
        if (i.getLogo() != null) {
            String b64 = Base64.getEncoder().encodeToString(i.getLogo());
            m.put("logoBase64", "data:image/*;base64," + b64);
        } else {
            m.put("logoBase64", null);
        }
        return m;
    }
}
