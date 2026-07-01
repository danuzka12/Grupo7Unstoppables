package olimpiadas_academicas_backend.backend.controller;

import olimpiadas_academicas_backend.backend.config.SecurityConfig;
import olimpiadas_academicas_backend.backend.service.institucionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(institucionController.class)
@Import(SecurityConfig.class)
class institucionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private institucionService service;

    @Test
    void listar_deberiaRetornar200ConLaListaDeInstituciones() throws Exception {
        when(service.listar()).thenReturn(List.of(Map.of("idInstitucion", 1L, "nombre", "Colegio ABC")));

        mockMvc.perform(get("/api/instituciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Colegio ABC"));
    }

    @Test
    void obtener_deberiaRetornar200ConLaInstitucionSolicitada() throws Exception {
        when(service.obtener(1L)).thenReturn(Map.of("idInstitucion", 1L, "nombre", "Colegio ABC"));

        mockMvc.perform(get("/api/instituciones/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Colegio ABC"));
    }

    @Test
    void crear_deberiaRetornar201_cuandoElNombreEsValido() throws Exception {
        when(service.crear(any(), any(), any(), any(), any()))
                .thenReturn(Map.of("idInstitucion", 1L, "nombre", "Colegio ABC"));

        mockMvc.perform(multipart("/api/instituciones")
                        .param("nombre", "Colegio ABC")
                        .param("email", "contacto@colegioabc.edu"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Colegio ABC"));
    }

    @Test
    void crear_deberiaRetornar400_cuandoFaltaElNombre() throws Exception {
        mockMvc.perform(multipart("/api/instituciones")
                        .param("email", "contacto@colegioabc.edu"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void eliminar_deberiaRetornar204_cuandoLaInstitucionExiste() throws Exception {
        doNothing().when(service).eliminar(1L);

        mockMvc.perform(delete("/api/instituciones/1"))
                .andExpect(status().isNoContent());
    }
}
