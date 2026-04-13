package tn.esprit.certifications.core.service;

import org.springframework.stereotype.Service;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.repository.CertificationRepository;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class DocumentGenerationServiceImpl implements DocumentGenerationService {

    private final CertificationRepository certificationRepository;

    public DocumentGenerationServiceImpl(CertificationRepository certificationRepository) {
        this.certificationRepository = certificationRepository;
    }

    @Override
    public String generateCertificationDocument(Long certificationId) {
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.ENGLISH);

        String issueDate = certification.getIssueDate() != null
                ? certification.getIssueDate().format(dateFormatter)
                : "N/A";
        String expiryDate = certification.getExpiryDate() != null
                ? certification.getExpiryDate().format(dateFormatter)
                : "N/A";

        StringBuilder builder = new StringBuilder();
        builder.append("=== CERTIFICATION DOCUMENT ===").append(System.lineSeparator());
        builder.append("ID: ").append(certification.getId()).append(System.lineSeparator());
        builder.append("Name: ").append(certification.getName()).append(System.lineSeparator());
        builder.append("Description: ").append(
                certification.getDescription() != null ? certification.getDescription() : "N/A"
        ).append(System.lineSeparator());
        builder.append("Version: ").append(
                certification.getVersion() != null ? certification.getVersion() : "N/A"
        ).append(System.lineSeparator());
        builder.append("Issue Date: ").append(issueDate).append(System.lineSeparator());
        builder.append("Expiry Date: ").append(expiryDate).append(System.lineSeparator());
        builder.append("Validity (days): ").append(
                certification.getValidityDays() != null ? certification.getValidityDays() : "N/A"
        ).append(System.lineSeparator());
        builder.append("Owner Email: ").append(
                certification.getOwnerEmail() != null ? certification.getOwnerEmail() : "N/A"
        ).append(System.lineSeparator());

        return builder.toString();
    }
}

