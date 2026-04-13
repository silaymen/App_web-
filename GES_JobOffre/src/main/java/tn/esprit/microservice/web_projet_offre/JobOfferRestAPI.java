package tn.esprit.microservice.web_projet_offre;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/joboffers")
@RequiredArgsConstructor
public class JobOfferRestAPI {

    private final JobOfferService jobOfferService;

    @PostMapping
    public ResponseEntity<JobOffer> create(@RequestBody JobOffer jobOffer) {
        return ResponseEntity.ok(jobOfferService.create(jobOffer));
    }

    @GetMapping
    public ResponseEntity<List<JobOffer>> getAll() {
        return ResponseEntity.ok(jobOfferService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOffer> update(@PathVariable Long id,
                                           @RequestBody JobOffer jobOffer) {
        return ResponseEntity.ok(jobOfferService.update(id, jobOffer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobOfferService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobOffer>> search(@RequestParam String name) {
        return ResponseEntity.ok(jobOfferService.searchByName(name));
    }

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, I'm the JobOffer Micro-Service";
    }
}