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


    @PostMapping
    public Formation create(@RequestBody Formation formation) {
        return service.create(formation);
    }

    @GetMapping
    public List<Formation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        return service.getById(id);
    }


    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id,
                            @RequestBody Formation formation) {
        return service.update(id, formation);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/active")
    public Page<Formation> getActive(
            @RequestParam int page,
            @RequestParam int size) {
        return service.getActiveFormations(page, size);
    }

    @GetMapping("/search")
    public List<Formation> search(@RequestParam String title) {
        return service.searchByTitle(title);
    }

    @GetMapping("/category")
    public List<Formation> byCategory(@RequestParam String categorie) {
        return service.filterByCategory(categorie);
    }

    @PutMapping("/deactivate/{id}")
    public Formation deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }
}