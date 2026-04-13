package tn.esprit.certifications.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "certifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private String version;

    private Integer validityDays;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private String ownerEmail;
}

