package tn.esprit.microservice.web_projet_offre;

/**
 * DTO pour représenter un Candidat venant d'un autre microservice
 * (Simplifié pour la démonstration)
 */
public class CandidatDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String competences;

    // Constructeurs
    public CandidatDTO() {
    }

    public CandidatDTO(Long id, String nom, String prenom, String email, String competences) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.competences = competences;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCompetences() {
        return competences;
    }

    public void setCompetences(String competences) {
        this.competences = competences;
    }

    @Override
    public String toString() {
        return "CandidatDTO{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", email='" + email + '\'' +
                ", competences='" + competences + '\'' +
                '}';
    }
}
