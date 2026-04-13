package tn.esprit.microservice.web_projet_offre.consumers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.web_projet_offre.config.RabbitMQConfig;
import tn.esprit.microservice.web_projet_offre.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.JOB_OFFRE_USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in Job Offre Service: {}", event);
        
        if ("SYNCED".equals(event.getEventType()) || "UPDATED".equals(event.getEventType())) {
            log.info("Synchronizing data for user: {} ({})", event.getUsername(), event.getEmail());
            // Here you can add logic to save to local DB if needed
        } else if ("DELETED".equals(event.getEventType())) {
            log.warn("User {} has been deleted from system.", event.getId());
        }
    }
}
