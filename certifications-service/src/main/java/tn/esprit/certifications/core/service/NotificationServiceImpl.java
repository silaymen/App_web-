package tn.esprit.certifications.core.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.esprit.certifications.core.entity.Certification;
import tn.esprit.certifications.core.repository.CertificationRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final CertificationRepository certificationRepository;

    public NotificationServiceImpl(CertificationRepository certificationRepository) {
        this.certificationRepository = certificationRepository;
    }

    @Override
    public String sendExpirationNotification(Long certificationId) {
        Certification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        LocalDate today = LocalDate.now();
        LocalDate expiryDate = certification.getExpiryDate();

        String owner = certification.getOwnerEmail() != null
                ? certification.getOwnerEmail()
                : "owner";

        String message;

        if (expiryDate == null) {
            message = String.format(
                    "Certification '%s' (ID: %d) has no expiry date defined.",
                    certification.getName(),
                    certification.getId()
            );
        } else {
            long daysUntilExpiry = ChronoUnit.DAYS.between(today, expiryDate);

            if (daysUntilExpiry < 0) {
                message = String.format(
                        "Certification '%s' (ID: %d) for %s has expired %d days ago (on %s).",
                        certification.getName(),
                        certification.getId(),
                        owner,
                        Math.abs(daysUntilExpiry),
                        expiryDate
                );
            } else if (daysUntilExpiry == 0) {
                message = String.format(
                        "Certification '%s' (ID: %d) for %s expires today (%s).",
                        certification.getName(),
                        certification.getId(),
                        owner,
                        expiryDate
                );
            } else {
                message = String.format(
                        "Certification '%s' (ID: %d) for %s will expire in %d day(s) on %s.",
                        certification.getName(),
                        certification.getId(),
                        owner,
                        daysUntilExpiry,
                        expiryDate
                );
            }
        }

        // For now we simply log the message; later this can be replaced with email/SMS sending logic.
        logger.info(message);
        return message;
    }
}

