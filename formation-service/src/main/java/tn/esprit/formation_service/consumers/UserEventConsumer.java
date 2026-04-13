package tn.esprit.formation_service.consumers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.formation_service.config.RabbitMQConfig;
import tn.esprit.formation_service.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.FORMATION_USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in Formation Service: {}", event);
        
        if ("SYNCED".equals(event.getEventType()) || "UPDATED".equals(event.getEventType())) {
            // Logic to sync local database or trigger business rules
            log.info("Syncing user {} data locally...", event.getUsername());
        } else if ("DELETED".equals(event.getEventType())) {
            log.warn("User {} has been deleted/blocked. Taking appropriate actions...", event.getId());
        }
    }
}
