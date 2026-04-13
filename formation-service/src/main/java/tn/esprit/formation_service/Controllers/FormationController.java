package tn.esprit.formation_service.Controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
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

    @GetMapping("/{id:\\d+}")
    public Formation getById(@PathVariable Long id) {
        return service.getById(id);
    }


    @PutMapping("/{id:\\d+}")
    public Formation update(@PathVariable Long id,
                            @RequestBody Formation formation) {
        return service.update(id, formation);
    }


    @DeleteMapping("/{id:\\d+}")
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

    @PutMapping("/deactivate/{id:\\d+}")
    public Formation deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PutMapping("/activate/{id:\\d+}")
    public Formation activate(@PathVariable Long id) {
        return service.activate(id);
    }

    /**
     * Métier prix max. {@code {id:\\d+}} sur les autres mappings évite qu'un segment texte
     * soit pris pour un id (sinon erreurs ou 404 selon la version).
     * Les deux chemins sont équivalents pour Postman / clients.
     */
    @GetMapping({"/by-max-price", "/filter/by-max-price"})
    public List<Formation> byMaxPrice(@RequestParam Double prixMax) {
        if (prixMax == null || prixMax < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prixMax doit être défini et >= 0");
        }
        return service.findByMaxPrice(prixMax);
    }
}