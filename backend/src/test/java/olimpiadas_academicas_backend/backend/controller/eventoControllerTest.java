package olimpiadas_academicas_backend.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import olimpiadas_academicas_backend.backend.config.SecurityConfig;
import olimpiadas_academicas_backend.backend.dto.eventoDTO;
import olimpiadas_academicas_backend.backend.service.eventoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(eventoController.class)
@Import(SecurityConfig.class)
class eventoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private eventoService service;

    private eventoDTO dtoValido() {
        eventoDTO dto = new eventoDTO();
        dto.setNombre("Olimpiadas de Verano 2026");
        dto.setFechaInicio(LocalDate.of(2026, 8, 1));
        dto.setFechaFin(LocalDate.of(2026, 8, 10));
        dto.setEstado("ABIERTO");
        dto.setIdInstitucion(1L);
        dto.setPremio("Trofeo y medallas");
        return dto;
    }

    @Test
    void listar_deberiaRetornar200ConLaListaDeEventos() throws Exception {
        when(service.listar()).thenReturn(List.of(Map.of("idEvento", 1L, "nombre", "Olimpiadas 2026")));

        mockMvc.perform(get("/api/eventos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idEvento").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Olimpiadas 2026"));
    }

    @Test
    void obtener_deberiaRetornar200ConElEventoSolicitado() throws Exception {
        when(service.obtener(1L)).thenReturn(Map.of("idEvento", 1L, "nombre", "Olimpiadas 2026"));

        mockMvc.perform(get("/api/eventos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Olimpiadas 2026"));
    }

    @Test
    void crear_deberiaRetornar201_cuandoLosDatosSonValidos() throws Exception {
        eventoDTO dto = dtoValido();
        when(service.crear(any(eventoDTO.class)))
                .thenReturn(Map.of("idEvento", 5L, "nombre", dto.getNombre()));

        mockMvc.perform(post("/api/eventos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idEvento").value(5))
                .andExpect(jsonPath("$.nombre").value(dto.getNombre()));
    }

    @Test
    void crear_deberiaRetornar400_cuandoFaltaElNombre() throws Exception {
        eventoDTO dto = dtoValido();
        dto.setNombre("");

        mockMvc.perform(post("/api/eventos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crear_deberiaRetornar400_cuandoFaltaLaInstitucion() throws Exception {
        eventoDTO dto = dtoValido();
        dto.setIdInstitucion(null);

        mockMvc.perform(post("/api/eventos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void actualizar_deberiaRetornar200_cuandoElEventoExiste() throws Exception {
        eventoDTO dto = dtoValido();
        when(service.actualizar(eq(1L), any(eventoDTO.class)))
                .thenReturn(Map.of("idEvento", 1L, "nombre", dto.getNombre()));

        mockMvc.perform(put("/api/eventos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idEvento").value(1));
    }

    @Test
    void eliminar_deberiaRetornar204_cuandoElEventoExiste() throws Exception {
        doNothing().when(service).eliminar(1L);

        mockMvc.perform(delete("/api/eventos/1"))
                .andExpect(status().isNoContent());
    }
}
