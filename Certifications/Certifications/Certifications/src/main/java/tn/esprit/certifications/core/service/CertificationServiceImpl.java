package tn.esprit.certifications.core.service;

import org.springframework.stereotype.Service;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.repository.CertificationRepository;

import java.util.List;

@Service
public class CertificationServiceImpl implements CertificationService {

    private final CertificationRepository certificationRepository;

    public CertificationServiceImpl(CertificationRepository certificationRepository) {
        this.certificationRepository = certificationRepository;
    }

    @Override
    public Certification create(Certification certification) {
        return certificationRepository.save(certification);
    }

    @Override
    public Certification update(Long id, Certification certification) {
        Certification existing = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        existing.setName(certification.getName());
        existing.setDescription(certification.getDescription());
        existing.setVersion(certification.getVersion());
        existing.setValidityDays(certification.getValidityDays());

        return certificationRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        certificationRepository.deleteById(id);
    }

    @Override
    public Certification getById(Long id) {
        return certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
    }

    @Override
    public List<Certification> getAll(String search, String sortBy, String direction) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                direction.equalsIgnoreCase("desc") ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC,
                sortBy
        );

        if (search != null && !search.isEmpty()) {
            return certificationRepository.findByNameContainingIgnoreCase(search, sort);
        }
        return certificationRepository.findAll(sort);
    }
}

