package tn.esprit.microservice.userservice.consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.userservice.config.RabbitMQConfig;
import tn.esprit.microservice.userservice.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in User Service (Internal Audit): {}", event);
        
        // This could be used for internal auditing, triggering notifications, 
        // or updating secondary cached data within the User Service itself.
        if ("SYNCED".equals(event.getEventType())) {
            log.info("User Service: Logged internal sync event for user {}", event.getUsername());
        }
    }
}
