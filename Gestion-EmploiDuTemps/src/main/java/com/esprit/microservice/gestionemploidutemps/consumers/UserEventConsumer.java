package com.esprit.microservice.gestionemploidutemps.consumers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import com.esprit.microservice.gestionemploidutemps.config.RabbitMQConfig;
import com.esprit.microservice.gestionemploidutemps.dto.UserEvent;

@Service
@Slf4j
public class UserEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.EMPLOIDUTEMPS_USER_QUEUE)
    public void consumeUserEvent(UserEvent event) {
        log.info("Received User Event in EmploiDuTemps Service: {}", event);
        
        if ("SYNCED".equals(event.getEventType()) || "UPDATED".equals(event.getEventType())) {
            log.info("Refreshing local cache for user: {}", event.getUsername());
        } else if ("DELETED".equals(event.getEventType())) {
            log.warn("Account {} is no longer active in the system.", event.getId());
        }
    }
}
