package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.dto.loginDTO;
import olimpiadas_academicas_backend.backend.model.usuario;
import olimpiadas_academicas_backend.backend.repository.usuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")

@CrossOrigin(origins = "http://localhost:5173")
public class authController {

        @Autowired
        private usuarioRepository usuarioRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @PostMapping("/login")
        public ResponseEntity<?> login(
                        @RequestBody loginDTO request) {

                Optional<usuario> optionalUsuario = usuarioRepository.findByEmail(request.getEmail());

                if (optionalUsuario.isEmpty()) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "error",
                                                        "Usuario no encontrado"));
                }

                usuario usuario = optionalUsuario.get();

                boolean passwordCorrecto = passwordEncoder.matches(
                                request.getPassword(),
                                usuario.getPasswordHash());

                if (!passwordCorrecto) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "error",
                                                        "Contraseña incorrecta"));
                }

                Map<String, Object> response = new HashMap<>();

                response.put("idUsuario", usuario.getIdUsuario());

                response.put("nombres", usuario.getNombres());

                response.put("apellidos", usuario.getApellidos());

                response.put("email", usuario.getEmail());

                response.put(
                                "rol",
                                usuario.getRol().getNombre());

                response.put(
                                "institucion",
                                usuario.getInstitucion() != null
                                                ? usuario.getInstitucion().getNombre()
                                                : null);

                return ResponseEntity.ok(response);
        }
}