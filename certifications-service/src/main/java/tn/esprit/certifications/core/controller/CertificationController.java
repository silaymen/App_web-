package tn.esprit.certifications.core.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.service.CertificationService;

import java.util.List;

@RestController
@RequestMapping("/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @PostMapping
    public ResponseEntity<Certification> create(@RequestBody Certification certification) {
        return ResponseEntity.ok(certificationService.create(certification));
    }

    @GetMapping
    public ResponseEntity<List<Certification>> getAll() {
        return ResponseEntity.ok(certificationService.getAll());
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

    @GetMapping("/search")
    public ResponseEntity<List<Certification>> search(@RequestParam String name) {
        return ResponseEntity.ok(certificationService.searchByName(name));
    }
}