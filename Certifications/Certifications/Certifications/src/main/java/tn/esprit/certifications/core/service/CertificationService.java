package tn.esprit.certifications.core.service;

import tn.esprit.certifications.core.entity.Certification;

import java.util.List;

public interface CertificationService {

    Certification create(Certification certification);

    Certification update(Long id, Certification certification);

    void delete(Long id);

    Certification getById(Long id);

    List<Certification> getAll(String search, String sortBy, String direction);
}

