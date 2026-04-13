package tn.esprit.microservice.web_projet_offre;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur de test pour démontrer l'utilisation d'OpenFeign
 */
@RestController
@RequestMapping("/feign-test")
public class FeignTestController {

    @Autowired
    private CandidatClient candidatClient;
    
    @Autowired
    private JobOfferService jobOfferService;

    /**
     * Test 1 : Appeler le service Candidat via Feign
     * 
     * URL de test : GET http://localhost:6325/feign-test/candidat/1
     */
    @GetMapping("/candidat/{id}")
    public ResponseEntity<?> getCandidatViaFeign(@PathVariable Long id) {
        try {
            // Appel synchrone au microservice Candidat via Feign
            CandidatDTO candidat = candidatClient.getCandidatById(id);
            
            return ResponseEntity.ok(candidat);
            
        } catch (Exception e) {
            // Si le service Candidat n'est pas disponible
            return ResponseEntity.status(503)
                    .body("Service Candidat indisponible : " + e.getMessage());
        }
    }

    /**
     * Test 2 : Vérifier si un candidat existe avant de créer une candidature
     * 
     * URL de test : GET http://localhost:6325/feign-test/check-candidat/1
     */
    @GetMapping("/check-candidat/{id}")
    public ResponseEntity<String> checkCandidat(@PathVariable Long id) {
        try {
            Boolean exists = candidatClient.candidatExists(id);
            
            if (Boolean.TRUE.equals(exists)) {
                return ResponseEntity.ok("Le candidat existe ✓");
            } else {
                return ResponseEntity.ok("Le candidat n'existe pas ✗");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(503)
                    .body("Erreur lors de la vérification : " + e.getMessage());
        }
    }

    /**
     * Test 3 : Exemple d'utilisation métier
     * Récupérer une offre ET les infos du candidat qui a postulé
     * 
     * URL de test : GET http://localhost:6325/feign-test/offer-with-candidat/1/2
     */
    @GetMapping("/offer-with-candidat/{offerId}/{candidatId}")
    public ResponseEntity<?> getOfferWithCandidat(
            @PathVariable Long offerId,
            @PathVariable Long candidatId) {
        
        try {
            // Récupérer l'offre localement
            JobOffer offer = jobOfferService.getById(offerId);
            
            // Récupérer le candidat via Feign
            CandidatDTO candidat = candidatClient.getCandidatById(candidatId);
            
            // Créer une réponse combinée riche en informations (Métier implémenté)
            String response = String.format(
                "Détails de la Candidature :\n--------------------------\n" +
                "Offre ID : %d\n" +
                "Poste : %s (%s)\n" +
                "Contrat : %s | Salaire : %s\n" +
                "--------------------------\n" +
                "Profil du Candidat :\n" +
                "Nom : %s %s\n" +
                "Email : %s\n" +
                "--------------------------",
                offer.getIdJoboffer(),
                offer.getNameJoboffer(), offer.getSkillsOffer(),
                offer.getContratTypeoffer(), offer.getOfferSalary(),
                candidat.getNom(),
                candidat.getPrenom(),
                candidat.getEmail()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(503)
                    .body("Erreur : " + e.getMessage());
        }
    }
}
