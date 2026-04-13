package com.esprit.microservice.gestionemploidutemps;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.List;

@RestController
@RequestMapping("/seances")
public class SeanceRestAPI {

    @Autowired
    private SeanceService seanceService;

    @Autowired
    private DataSource dataSource;

    private String title = "Hello, I'm the Seance Micro-Service";

    @GetMapping("/hello")
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok(title);
    }

    @GetMapping("/db-info")
    public ResponseEntity<String> getDbInfo() throws Exception {
        return ResponseEntity.ok(
                dataSource.getConnection().getMetaData().getDatabaseProductName()
        );
    }

    @GetMapping
    public ResponseEntity<List<Seance>> getAllSeances() {
        List<Seance> seances = seanceService.getAllSeances();

        if (seances.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(seances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seance> getSeanceById(@PathVariable Long id) {

        Seance seance = seanceService.getSeanceById(id);

        if (seance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(seance);
    }

    @PostMapping
    public ResponseEntity<Seance> createSeance(@RequestBody Seance seance) {
        Seance saved = seanceService.createSeance(seance);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Seance> updateSeance(
            @PathVariable Long id,
            @RequestBody Seance seance) {

        Seance updated = seanceService.updateSeance(id, seance);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeance(@PathVariable Long id) {
        seanceService.deleteSeance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/classe")
    public ResponseEntity<Page<Seance>> searchByClasse(
            @RequestParam String classe,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                seanceService.searchByClasse(classe, pageable)
        );
    }

    @GetMapping("/search/enseignant")
    public ResponseEntity<Page<Seance>> searchByEnseignant(
            @RequestParam String nom,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                seanceService.searchByEnseignant(nom, pageable)
        );
    }
}