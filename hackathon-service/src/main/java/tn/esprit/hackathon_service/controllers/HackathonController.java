package tn.esprit.hackathon_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.hackathon_service.entities.Hackathon;
import tn.esprit.hackathon_service.services.HackathonService;

import java.util.List;

@RestController
@RequestMapping("/hackathons")
@RequiredArgsConstructor
public class HackathonController {
    
    private final HackathonService service;

    @GetMapping
    public ResponseEntity<List<Hackathon>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(service.getAll(search, sortBy, direction));
    }

    @PostMapping
    public ResponseEntity<Hackathon> create(@RequestBody Hackathon hackathon) {
        return ResponseEntity.ok(service.create(hackathon));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hackathon> getById(@PathVariable Long id) {
        Hackathon h = service.getById(id);
        return h != null ? ResponseEntity.ok(h) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hackathon> update(@PathVariable Long id, @RequestBody Hackathon hackathon) {
        Hackathon h = service.update(id, hackathon);
        return h != null ? ResponseEntity.ok(h) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
