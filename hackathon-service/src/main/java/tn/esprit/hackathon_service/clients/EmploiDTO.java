package tn.esprit.hackathon_service.clients;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmploiDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private String location;
}
