package tn.esprit.certifications.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.repository.CertificationRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;

    // CREATE
    public Certification create(Certification certification) {
        if (certification.getIssueDate() == null) {
            certification.setIssueDate(LocalDate.now());
        }
        if (certification.getExpiryDate() == null && certification.getValidityDays() != null) {
            certification.setExpiryDate(certification.getIssueDate().plusDays(certification.getValidityDays()));
        }
        return certificationRepository.save(certification);
    }

    // READ ALL
    public List<Certification> getAll() {
        return certificationRepository.findAll();
    }

    // READ BY ID
    public Certification getById(Long id) {
        return certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
    }

    // UPDATE
    public Certification update(Long id, Certification updated) {
        Certification certification = getById(id);

        certification.setName(updated.getName());
        certification.setDescription(updated.getDescription());
        certification.setVersion(updated.getVersion());
        certification.setValidityDays(updated.getValidityDays());
        certification.setIssueDate(updated.getIssueDate());
        certification.setExpiryDate(updated.getExpiryDate());
        certification.setOwnerEmail(updated.getOwnerEmail());

        return certificationRepository.save(certification);
    }

    // DELETE
    public void delete(Long id) {
        certificationRepository.deleteById(id);
    }

    // SEARCH
    public List<Certification> searchByName(String name) {
        return certificationRepository.findByNameContainingIgnoreCase(name);
    }
}
