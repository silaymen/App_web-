package tn.esprit.certifications.core.service;

/**
 * Service responsible for generating human‑readable certification documents.
 * For now, it returns simple text content, but it can later be extended to generate PDF, HTML, etc.
 */
public interface DocumentGenerationService {

    /**
     * Generate a document describing the certification with the given id.
     *
     * @param certificationId the id of the certification
     * @return generated document content as plain text
     */
    String generateCertificationDocument(Long certificationId);
}

