package tn.esprit.microservice.userservice.producer;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.userservice.config.RabbitMQConfig;
import tn.esprit.microservice.userservice.dto.UserEvent;

@Service
@RequiredArgsConstructor
public class UserEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendUserEvent(UserEvent event) {
        System.out.println("Broadcasting User Event via RabbitMQ: " + event.getEventType() + " for user " + event.getUsername());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.USER_ROUTING_KEY, event);
    }
}
