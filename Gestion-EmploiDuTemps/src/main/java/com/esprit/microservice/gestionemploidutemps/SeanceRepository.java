package com.esprit.microservice.gestionemploidutemps;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeanceRepository extends JpaRepository<Seance, Long> {

    // Recherche par classe avec pagination
    Page<Seance> findByClasseContainingIgnoreCase(String classe, Pageable pageable);

    // Recherche personnalisée par enseignant avec pagination
    @Query("SELECT s FROM Seance s WHERE s.enseignant LIKE %:nom%")
    Page<Seance> findByEnseignantNom(@Param("nom") String nom, Pageable pageable);
}