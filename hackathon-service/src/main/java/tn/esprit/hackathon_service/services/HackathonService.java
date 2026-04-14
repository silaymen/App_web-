package tn.esprit.hackathon_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tn.esprit.hackathon_service.entities.Hackathon;
import tn.esprit.hackathon_service.repositories.HackathonRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HackathonService {
    
    private final HackathonRepository repository;

    public List<Hackathon> getAll(String search, String sortBy, String direction) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = sortBy != null ? sortBy : "id";
        
        return repository.findWithDynamicSearch(search, Sort.by(dir, sortProperty));
    }

    public Hackathon create(Hackathon hackathon) {
        return repository.save(hackathon);
    }

    public Hackathon getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Hackathon update(Long id, Hackathon hackathon) {
        if (repository.existsById(id)) {
            hackathon.setId(id);
            return repository.save(hackathon);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
