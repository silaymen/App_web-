package tn.esprit.hackathon_service.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "emploidutemps-service", path = "/seances")
public interface EmploiClient {
    
    @GetMapping
    List<EmploiDTO> getAllSeances();

    @GetMapping("/{id}")
    EmploiDTO getSeanceById(@PathVariable("id") Long id);
}
