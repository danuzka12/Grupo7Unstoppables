package olimpiadas_academicas_backend.backend.service;

import olimpiadas_academicas_backend.backend.dto.usuarioDTO;
import olimpiadas_academicas_backend.backend.model.institucion;
import olimpiadas_academicas_backend.backend.model.rol;
import olimpiadas_academicas_backend.backend.model.usuario;
import olimpiadas_academicas_backend.backend.repository.institucionRepository;
import olimpiadas_academicas_backend.backend.repository.rolRepository;
import olimpiadas_academicas_backend.backend.repository.usuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class usuarioService {
    private final usuarioRepository usuarioRepository;
    private final rolRepository rolRepository;
    private final institucionRepository institucionRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public usuarioService(
            usuarioRepository usuarioRepository,
            rolRepository rolRepository,
            institucionRepository institucionRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.institucionRepository = institucionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // LISTAR
    public List<usuario> listar() {
        return usuarioRepository.findAll();
    }

    // CREAR
    public usuario crear(usuarioDTO request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El correo ya existe");
        }

        rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        institucion institucion = null;

        if (request.getIdInstitucion() != null) {
            institucion = institucionRepository.findById(request.getIdInstitucion())
                    .orElseThrow(() -> new RuntimeException("Institución no encontrada"));
        }

        usuario usuario = new usuario();

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());

        usuario.setRol(rol);
        usuario.setInstitucion(institucion);

        usuario.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        usuario.setActivo(true);

        usuario.setCreatedAt(LocalDateTime.now());
        usuario.setUpdatedAt(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }

    // ELIMINAR
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    // ACTUALIZAR
    public usuario actualizar(Long id, usuarioDTO request) {

        usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // validar email duplicado (solo si cambió)
        if (!usuario.getEmail().equals(request.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("El correo ya existe");
            }
        }

        rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        institucion institucion = null;

        if (request.getIdInstitucion() != null) {
            institucion = institucionRepository.findById(request.getIdInstitucion())
                    .orElseThrow(() -> new RuntimeException("Institución no encontrada"));
        }

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());

        usuario.setRol(rol);
        usuario.setInstitucion(institucion);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            usuario.setPasswordHash(
                    passwordEncoder.encode(request.getPassword()));
        }

        usuario.setUpdatedAt(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }
}