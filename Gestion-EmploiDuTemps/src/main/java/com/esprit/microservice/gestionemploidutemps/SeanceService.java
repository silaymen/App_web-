package com.esprit.microservice.gestionemploidutemps;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeanceService {

    @Autowired
    private SeanceRepository seanceRepository;

    // 🔹 Lister toutes les séances
    public List<Seance> getAllSeances() {
        return seanceRepository.findAll();
    }

    // 🔹 Récupérer par ID
    public Seance getSeanceById(Long id) {
        Optional<Seance> seance = seanceRepository.findById(id);
        return seance.orElse(null);
    }

    // 🔹 Ajouter
    public Seance createSeance(Seance seance) {
        return seanceRepository.save(seance);
    }

    // 🔹 Modifier
    public Seance updateSeance(Long id, Seance updatedSeance) {

        return seanceRepository.findById(id)
                .map(seance -> {
                    seance.setDate(updatedSeance.getDate());
                    seance.setHeureDebut(updatedSeance.getHeureDebut());
                    seance.setHeureFin(updatedSeance.getHeureFin());
                    seance.setEnseignant(updatedSeance.getEnseignant());
                    seance.setMatiere(updatedSeance.getMatiere());
                    seance.setClasse(updatedSeance.getClasse());
                    seance.setSalle(updatedSeance.getSalle());
                    seance.setTypeSeance(updatedSeance.getTypeSeance());
                    return seanceRepository.save(seance);
                }).orElse(null);
    }

    // 🔹 Supprimer
    public void deleteSeance(Long id) {
        seanceRepository.deleteById(id);
    }

    // 🔹 Recherche par classe
    public Page<Seance> searchByClasse(String classe, Pageable pageable) {
        return seanceRepository.findByClasseContainingIgnoreCase(classe, pageable);
    }

    // 🔹 Recherche par enseignant
    public Page<Seance> searchByEnseignant(String nom, Pageable pageable) {
        return seanceRepository.findByEnseignantNom(nom, pageable);
    }
}