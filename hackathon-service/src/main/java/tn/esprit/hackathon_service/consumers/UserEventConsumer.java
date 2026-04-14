package tn.esprit.hackathon_service.consumers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.hackathon_service.config.RabbitMQConfig;
import tn.esprit.hackathon_service.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.HACKATHON_USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in Hackathon Service: {} type: {}", event.getUsername(), event.getEventType());
        // Handle user sync if needed (e.g. check permissions for creating hackathons)
    }
}
