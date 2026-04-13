package tn.esprit.microservice.web_projet_offre;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    // Recherche par nom
    List<JobOffer> findByNameJobofferContainingIgnoreCase(String name);
}
