package olimpiadas_academicas_backend.backend.service;

import jakarta.persistence.EntityManager;
import olimpiadas_academicas_backend.backend.dto.eventoDTO;
import olimpiadas_academicas_backend.backend.model.evento;
import olimpiadas_academicas_backend.backend.model.institucion;
import olimpiadas_academicas_backend.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class eventoServiceTest {

    @Mock
    private eventoRepository eventoRepo;
    @Mock
    private eventoDeporteRepository eventoDepRepo;
    @Mock
    private deporteRepository deporteRepo;
    @Mock
    private categoriaRepository categoriaRepo;
    @Mock
    private institucionRepository institucionRepo;
    @Mock
    private emailService emailSvc;
    @Mock
    private EntityManager em;

    @InjectMocks
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
    void crear_deberiaEnviarCorreoDeConfirmacion_cuandoLaInstitucionTieneEmail() {
        when(eventoRepo.save(any(evento.class))).thenAnswer(inv -> {
            evento e = inv.getArgument(0);
            e.setIdEvento(10L);
            return e;
        });

        institucion inst = new institucion();
        inst.setEmail("colegio@correo.com");
        when(institucionRepo.findById(1L)).thenReturn(Optional.of(inst));
        when(eventoDepRepo.findByEvento_IdEvento(10L)).thenReturn(List.of());

        service.crear(dtoValido());

        verify(emailSvc).enviar(
                eq("colegio@correo.com"),
                contains("Olimpiadas de Verano 2026"),
                contains("Trofeo y medallas"));
    }

    @Test
    void crear_noDeberiaEnviarCorreo_cuandoLaInstitucionNoTieneEmailConfigurado() {
        when(eventoRepo.save(any(evento.class))).thenAnswer(inv -> {
            evento e = inv.getArgument(0);
            e.setIdEvento(11L);
            return e;
        });

        institucion inst = new institucion();
        inst.setEmail(null);
        when(institucionRepo.findById(1L)).thenReturn(Optional.of(inst));

        service.crear(dtoValido());

        verify(emailSvc, never()).enviar(any(), any(), any());
    }

    @Test
    void crear_noDeberiaEnviarCorreo_cuandoLaInstitucionNoExiste() {
        when(eventoRepo.save(any(evento.class))).thenAnswer(inv -> {
            evento e = inv.getArgument(0);
            e.setIdEvento(12L);
            return e;
        });

        when(institucionRepo.findById(1L)).thenReturn(Optional.empty());

        service.crear(dtoValido());

        verify(emailSvc, never()).enviar(any(), any(), any());
    }

    @Test
    void crear_deberiaLanzarBadRequest_cuandoElEstadoEsInvalido() {
        eventoDTO dto = dtoValido();
        dto.setEstado("ESTADO_QUE_NO_EXISTE");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.crear(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verifyNoInteractions(eventoRepo, emailSvc);
    }

    @Test
    void obtener_deberiaLanzarNotFound_cuandoElEventoNoExiste() {
        when(eventoRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.obtener(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
