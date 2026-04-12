package tn.esprit.formation_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tn.esprit.formation_service.Entities.Formation;
import tn.esprit.formation_service.Repositories.FormationRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository repository;

    // CREATE
    public Formation create(Formation formation) {
        formation.setDateCreation(LocalDate.now());
        if (formation.getActive() == null) {
            formation.setActive(Boolean.TRUE);
        }
        return repository.save(formation);
    }

    // READ ALL
    public List<Formation> getAll() {
        return repository.findAll();
    }

    // READ BY ID
    public Formation getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
    }

    // UPDATE
    public Formation update(Long id, Formation updated) {
        Formation formation = getById(id);

        formation.setTitre(updated.getTitre());
        formation.setDescription(updated.getDescription());
        formation.setCategorie(updated.getCategorie());
        formation.setPrix(updated.getPrix());
        if (updated.getActive() != null) {
            formation.setActive(updated.getActive());
        }

        return repository.save(formation);
    }

    // DELETE
    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Page<Formation> getActiveFormations(int page, int size) {
        return repository.findByActiveTrue(PageRequest.of(page, size));
    }

    public List<Formation> searchByTitle(String title) {
        return repository.findByTitreContainingIgnoreCase(title);
    }

    public List<Formation> filterByCategory(String categorie) {
        return repository.findByCategorie(categorie);
    }

    public Formation deactivate(Long id) {
        Formation formation = getById(id);
        formation.setActive(false);
        return repository.save(formation);
    }

    public Formation activate(Long id) {
        Formation formation = getById(id);
        formation.setActive(true);
        return repository.save(formation);
    }

    /** Formations dont le prix est inférieur ou égal au plafond (métier). */
    public List<Formation> findByMaxPrice(double prixMax) {
        return repository.findByPrixLessThanEqual(prixMax);
    }
}