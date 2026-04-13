package tn.esprit.formation_service.Repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.formation_service.Entities.Formation;

import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    // Recherche par titre
    List<Formation> findByTitreContainingIgnoreCase(String titre);

    // Filtre par catégorie
    List<Formation> findByCategorie(String categorie);

    // Formations visibles sur le catalogue public : actives ou champ non renseigné (legacy)
    @Query("SELECT f FROM Formation f WHERE f.active IS NULL OR f.active = true")
    Page<Formation> findPublishedForCatalog(Pageable pageable);

    // Formations strictement actives (admin / stats)
    Page<Formation> findByActiveTrue(Pageable pageable);

    // Filtre prix max
    List<Formation> findByPrixLessThanEqual(Double prix);
}