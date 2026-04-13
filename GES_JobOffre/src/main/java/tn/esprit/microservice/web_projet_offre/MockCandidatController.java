package tn.esprit.microservice.web_projet_offre;

import org.springframework.web.bind.annotation.*;

/**
 * ⚠️ MOCK TEMPORAIRE - Pour tester OpenFeign sans créer un vrai microservice Candidat
 * 
 * Ce contrôleur simule les réponses du service Candidat
 * À SUPPRIMER quand vous aurez un vrai microservice Candidat
 * 
 * Pour tester, changez le port dans CandidatClient à 6325 temporairement
 */
@RestController
@RequestMapping("/candidats")
public class MockCandidatController {

    @GetMapping("/{id}")
    public CandidatDTO getMockCandidat(@PathVariable Long id) {
        
        // Données de test
        if (id == 1) {
            return new CandidatDTO(1L, "Dupont", "Jean", "jean.dupont@email.com", "Java, Spring Boot, Angular");
        } else if (id == 2) {
            return new CandidatDTO(2L, "Martin", "Sophie", "sophie.martin@email.com", "React, Node.js, MongoDB");
        } else if (id == 3) {
            return new CandidatDTO(3L, "Bernard", "Luc", "luc.bernard@email.com", "Docker, Kubernetes, DevOps");
        } else {
            return new CandidatDTO(id, "Candidat", "Test", "test@email.com", "Compétences diverses");
        }
    }

    /**
     * Simule GET /candidats/{id}/exists
     * URL de test : http://localhost:6325/candidats/1/exists
     */
    @GetMapping("/{id}/exists")
    public Boolean candidatExists(@PathVariable Long id) {
        // Simule que les candidats 1 à 10 existent
        return id > 0 && id <= 10;
    }
}
