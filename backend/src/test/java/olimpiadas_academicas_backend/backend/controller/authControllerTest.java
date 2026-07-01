package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.config.SecurityConfig;
import olimpiadas_academicas_backend.backend.model.rol;
import olimpiadas_academicas_backend.backend.model.usuario;
import olimpiadas_academicas_backend.backend.repository.usuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(authController.class)
@Import(SecurityConfig.class)
class authControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private usuarioRepository usuarioRepo;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private usuario usuarioDePrueba() {
        rol r = new rol();
        r.setNombre("ADMIN");

        usuario u = new usuario();
        u.setIdUsuario(1L);
        u.setNombres("Ana");
        u.setApellidos("Pérez");
        u.setEmail("ana@correo.com");
        u.setPasswordHash("hash-guardado");
        u.setRol(r);
        return u;
    }

    @Test
    void login_deberiaRetornar200_cuandoLasCredencialesSonCorrectas() throws Exception {
        when(usuarioRepo.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuarioDePrueba()));
        when(passwordEncoder.matches("1234", "hash-guardado")).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ana@correo.com\",\"password\":\"1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ana@correo.com"))
                .andExpect(jsonPath("$.rol").value("ADMIN"));
    }

    @Test
    void login_deberiaRetornar400_cuandoElUsuarioNoExiste() throws Exception {
        when(usuarioRepo.findByEmail("nadie@correo.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nadie@correo.com\",\"password\":\"1234\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Usuario no encontrado"));
    }

    @Test
    void login_deberiaRetornar400_cuandoLaContrasenaEsIncorrecta() throws Exception {
        when(usuarioRepo.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuarioDePrueba()));
        when(passwordEncoder.matches("incorrecta", "hash-guardado")).thenReturn(false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ana@correo.com\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Contraseña incorrecta"));
    }
}
