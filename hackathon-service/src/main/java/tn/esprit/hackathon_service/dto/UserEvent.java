package tn.esprit.hackathon_service.dto;

import lombok.Data;

@Data
public class UserEvent {
    private String id;
    private String username;
    private String email;
    private String eventType;
}
