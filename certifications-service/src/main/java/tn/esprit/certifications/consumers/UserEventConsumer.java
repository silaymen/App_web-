package tn.esprit.certifications.consumers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.certifications.config.RabbitMQConfig;
import tn.esprit.certifications.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.CERTIFICATIONS_USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in Certifications Service: {}", event);
        
        if ("SYNCED".equals(event.getEventType()) || "UPDATED".equals(event.getEventType())) {
            log.info("Processing data for user: {} - Event Type: {}", event.getUsername(), event.getEventType());
        } else if ("DELETED".equals(event.getEventType())) {
            log.warn("User {} has been soft-deleted from the platform.", event.getId());
        }
    }
}
