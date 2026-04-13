package tn.esprit.certifications.core.service;

import tn.esprit.certifications.core.entity.Certification;

/**
 * Service that handles expiration checks and renewal operations for certifications.
 */
public interface ExpirationAndRenewalService {

    /**
     * Check if a certification is expired based on its expiry date.
     *
     * @param certificationId the id of the certification
     * @return true if expired, false otherwise
     */
    boolean isExpired(Long certificationId);

    /**
     * Renew a certification by updating its issue and expiry dates.
     * By default, the new expiry date is computed as now + validityDays.
     *
     * @param certificationId the id of the certification
     * @return the updated certification
     */
    Certification renew(Long certificationId);
}

