package tn.esprit.certifications.core.service;

import org.springframework.stereotype.Service;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.repository.CertificationRepository;

import java.time.LocalDate;

@Service
public class ExpirationAndRenewalServiceImpl implements ExpirationAndRenewalService {

    private final CertificationRepository certificationRepository;

    public ExpirationAndRenewalServiceImpl(CertificationRepository certificationRepository) {
        this.certificationRepository = certificationRepository;
    }

    @Override
    public boolean isExpired(Long certificationId) {
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (certification.getExpiryDate() == null) {
            // If there is no expiry date yet, try to derive it from issueDate + validityDays
            if (certification.getIssueDate() != null && certification.getValidityDays() != null) {
                LocalDate derivedExpiry = certification.getIssueDate()
                        .plusDays(certification.getValidityDays());
                certification.setExpiryDate(derivedExpiry);
                certificationRepository.save(certification);
                return derivedExpiry.isBefore(LocalDate.now()) || derivedExpiry.isEqual(LocalDate.now());
            }
            // No expiry information available -> treat as not expired
            return false;
        }

        LocalDate today = LocalDate.now();
        return certification.getExpiryDate().isBefore(today) || certification.getExpiryDate().isEqual(today);
    }

    @Override
    public Certification renew(Long certificationId) {
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        LocalDate now = LocalDate.now();
        certification.setIssueDate(now);

        if (certification.getValidityDays() != null) {
            certification.setExpiryDate(now.plusDays(certification.getValidityDays()));
        }

        return certificationRepository.save(certification);
    }
}

