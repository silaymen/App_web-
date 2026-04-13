package tn.esprit.microservice.web_projet_offre;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    public JobOffer create(JobOffer jobOffer) {
        if (jobOffer.getOfferDate() == null) {
            jobOffer.setOfferDate(LocalDate.now());
        }
        return jobOfferRepository.save(jobOffer);
    }

    public List<JobOffer> getAll() {
        return jobOfferRepository.findAll();
    }

    public JobOffer getById(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JobOffer not found with id: " + id));
    }

    public JobOffer update(Long id, JobOffer updated) {
        JobOffer jobOffer = getById(id);
        jobOffer.setNameJoboffer(updated.getNameJoboffer());
        jobOffer.setDescriptionOffer(updated.getDescriptionOffer());
        jobOffer.setContratTypeoffer(updated.getContratTypeoffer());
        jobOffer.setOfferSalary(updated.getOfferSalary());
        jobOffer.setOfferDate(updated.getOfferDate());
        jobOffer.setSkillsOffer(updated.getSkillsOffer());
        return jobOfferRepository.save(jobOffer);
    }

    public void delete(Long id) {
        if (!jobOfferRepository.existsById(id)) {
            throw new RuntimeException("JobOffer not found with id: " + id);
        }
        jobOfferRepository.deleteById(id);
    }

    public List<JobOffer> searchByName(String name) {
        return jobOfferRepository.findByNameJobofferContainingIgnoreCase(name);
    }
}