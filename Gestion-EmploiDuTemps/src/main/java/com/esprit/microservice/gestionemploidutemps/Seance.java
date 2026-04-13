package com.esprit.microservice.gestionemploidutemps;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Seance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;

    private String enseignant;
    private String matiere;
    private String classe;
    private String salle;
    private String typeSeance;

    // Constructeurs
    public Seance() {}

    public Seance(LocalDate date, LocalTime heureDebut, LocalTime heureFin,
                  String enseignant, String matiere, String classe,
                  String salle, String typeSeance) {
        this.date = date;
        this.heureDebut = heureDebut;
        this.heureFin = heureFin;
        this.enseignant = enseignant;
        this.matiere = matiere;
        this.classe = classe;
        this.salle = salle;
        this.typeSeance = typeSeance;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getHeureDebut() { return heureDebut; }
    public void setHeureDebut(LocalTime heureDebut) { this.heureDebut = heureDebut; }

    public LocalTime getHeureFin() { return heureFin; }
    public void setHeureFin(LocalTime heureFin) { this.heureFin = heureFin; }

    public String getEnseignant() { return enseignant; }
    public void setEnseignant(String enseignant) { this.enseignant = enseignant; }

    public String getMatiere() { return matiere; }
    public void setMatiere(String matiere) { this.matiere = matiere; }

    public String getClasse() { return classe; }
    public void setClasse(String classe) { this.classe = classe; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public String getTypeSeance() { return typeSeance; }
    public void setTypeSeance(String typeSeance) { this.typeSeance = typeSeance; }
}