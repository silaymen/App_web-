package tn.esprit.formation_service.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    private String description;

    private String categorie;

    private Double prix;

    /** Wrapper: si absent du JSON en PUT, on ne réécrit pas l’état en base (évite de forcer false). */
    private Boolean active;

    private LocalDate dateCreation;
}