package tn.esprit.hackathon_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.hackathon_service.entities.Hackathon;

import java.util.List;

@Repository
public interface HackathonRepository extends JpaRepository<Hackathon, Long> {
    
    @Query("SELECT h FROM Hackathon h WHERE " +
           "(:search IS NULL OR LOWER(h.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Hackathon> findWithDynamicSearch(@Param("search") String search, org.springframework.data.domain.Sort sort);
}
