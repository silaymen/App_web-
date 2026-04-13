package tn.esprit.certifications.core.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.service.CertificationService;
import tn.esprit.certifications.core.service.DocumentGenerationService;
import tn.esprit.certifications.core.service.ExpirationAndRenewalService;
import tn.esprit.certifications.core.service.NotificationService;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/certifications")
public class CertificationController {

    private final CertificationService certificationService;
    private final DocumentGenerationService documentGenerationService;
    private final ExpirationAndRenewalService expirationAndRenewalService;
    private final NotificationService notificationService;

    public CertificationController(CertificationService certificationService,
                                   DocumentGenerationService documentGenerationService,
                                   ExpirationAndRenewalService expirationAndRenewalService,
                                   NotificationService notificationService) {
        this.certificationService = certificationService;
        this.documentGenerationService = documentGenerationService;
        this.expirationAndRenewalService = expirationAndRenewalService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<Certification> create(@RequestBody Certification certification) {
        return ResponseEntity.ok(certificationService.create(certification));
    }

    @GetMapping
    public ResponseEntity<List<Certification>> getAll(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction) {
        return ResponseEntity.ok(certificationService.getAll(search, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certification> getById(@PathVariable Long id) {
        return ResponseEntity.ok(certificationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Certification> update(@PathVariable Long id,
                                                @RequestBody Certification certification) {
        return ResponseEntity.ok(certificationService.update(id, certification));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Generate a simple text document for the given certification.
     */
    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> generateDocument(@PathVariable Long id) {
        String documentContent = documentGenerationService.generateCertificationDocument(id);
        byte[] bytes = documentContent.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "certification-" + id + ".txt");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    /**
     * Check if a certification is expired.
     */
    @GetMapping("/{id}/expired")
    public ResponseEntity<Boolean> isExpired(@PathVariable Long id) {
        return ResponseEntity.ok(expirationAndRenewalService.isExpired(id));
    }

    /**
     * Renew a certification by updating its issue and expiry dates.
     */
    @PostMapping("/{id}/renew")
    public ResponseEntity<Certification> renew(@PathVariable Long id) {
        return ResponseEntity.ok(expirationAndRenewalService.renew(id));
    }

    /**
     * Trigger an expiration notification for the certification and return the message.
     */
    @PostMapping("/{id}/notify-expiration")
    public ResponseEntity<String> notifyExpiration(@PathVariable Long id) {
        String message = notificationService.sendExpirationNotification(id);
        return ResponseEntity.ok(message);
    }
}

