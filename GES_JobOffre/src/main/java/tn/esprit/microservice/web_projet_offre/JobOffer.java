package tn.esprit.microservice.web_projet_offre;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idJoboffer;

    private String nameJoboffer;
    private String descriptionOffer;
    private String contratTypeoffer;
    private String offerSalary;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate offerDate;

    private String skillsOffer;
}