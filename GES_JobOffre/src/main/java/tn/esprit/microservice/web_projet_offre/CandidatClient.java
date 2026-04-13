package tn.esprit.microservice.web_projet_offre;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Client Feign pour communiquer avec le microservice Candidat
 * 
 * @FeignClient :
 * - name = nom du service dans Eureka
 * - url = URL directe (optionnel si Eureka est utilisé)
 * 
 * ⚠️ POUR TESTER : url = "http://localhost:6325" (utilise le mock local)
 * EN PRODUCTION : url = "http://localhost:8081" (vrai service Candidat)
 */
@FeignClient(name = "candidat-service", url = "http://localhost:6325")
public interface CandidatClient {

    /**
     * Appel REST GET vers le service Candidat
     * Équivalent à : RestTemplate.getForObject("http://localhost:8081/candidats/{id}")
     */
    @GetMapping("/candidats/{id}")
    CandidatDTO getCandidatById(@PathVariable("id") Long id);

    /**
     * Autre exemple : vérifier si un candidat existe
     */
    @GetMapping("/candidats/{id}/exists")
    Boolean candidatExists(@PathVariable("id") Long id);
}
