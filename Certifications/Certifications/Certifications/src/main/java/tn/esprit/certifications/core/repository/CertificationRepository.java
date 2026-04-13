package tn.esprit.certifications.core.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.certifications.core.entity.Certification;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByNameContainingIgnoreCase(String name, Sort sort);
}

