package tn.esprit.certifications.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.service.CertificationService;
import tn.esprit.certifications.core.service.DocumentGenerationService;
import tn.esprit.certifications.core.service.ExpirationAndRenewalService;
import tn.esprit.certifications.core.service.NotificationService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CertificationController.class)
class CertificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CertificationService certificationService;
    @MockBean
    private DocumentGenerationService documentGenerationService;
    @MockBean
    private ExpirationAndRenewalService expirationAndRenewalService;
    @MockBean
    private NotificationService notificationService;

    @Test
    void getAllReturnsJson() throws Exception {
        Certification c = new Certification();
        c.setId(1L);
        c.setName("Test");
        when(certificationService.getAll()).thenReturn(List.of(c));

        mockMvc.perform(get("/certifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test"));
    }

    @Test
    void createReturnsOk() throws Exception {
        Certification in = new Certification();
        in.setName("New");
        Certification out = new Certification();
        out.setId(2L);
        out.setName("New");
        when(certificationService.create(any(Certification.class))).thenReturn(out);

        mockMvc.perform(post("/certifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(in)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("New"));
    }
}
