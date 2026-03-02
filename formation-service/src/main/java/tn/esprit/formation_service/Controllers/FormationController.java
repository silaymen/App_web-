package tn.esprit.formation_service.Controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation_service.Entities.Formation;
import tn.esprit.formation_service.services.FormationService;

import java.util.List;

@RestController
@RequestMapping("/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService service;

    // CREATE
    @PostMapping
    public Formation create(@RequestBody Formation formation) {
        return service.create(formation);
    }

    // READ ALL
    @GetMapping
    public List<Formation> getAll() {
        return service.getAll();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id,
                            @RequestBody Formation formation) {
        return service.update(id, formation);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // 🔥 Pagination formations actives
    @GetMapping("/active")
    public Page<Formation> getActive(
            @RequestParam int page,
            @RequestParam int size) {
        return service.getActiveFormations(page, size);
    }

    // 🔥 Recherche par titre
    @GetMapping("/search")
    public List<Formation> search(@RequestParam String title) {
        return service.searchByTitle(title);
    }

    // 🔥 Filtre catégorie
    @GetMapping("/category")
    public List<Formation> byCategory(@RequestParam String categorie) {
        return service.filterByCategory(categorie);
    }

    // 🔥 Désactiver formation
    @PutMapping("/deactivate/{id}")
    public Formation deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }
}