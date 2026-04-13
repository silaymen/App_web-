package tn.esprit.certifications.core.service;

/**
 * Service responsible for notifying stakeholders about certification events (e.g. upcoming expiration).
 * Currently this service only builds notification messages; integration with real email/SMS
 * providers can be added later.
 */
public interface NotificationService {

    /**
     * Build a notification message for a certification that is close to expiring
     * or already expired, and perform any side‑effects such as logging.
     *
     * @param certificationId the id of the certification
     * @return the notification message
     */
    String sendExpirationNotification(Long certificationId);
}

