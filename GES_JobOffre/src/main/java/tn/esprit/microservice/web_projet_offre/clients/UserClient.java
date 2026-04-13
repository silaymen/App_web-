package tn.esprit.microservice.web_projet_offre.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import tn.esprit.microservice.web_projet_offre.dto.UserDTO;

@FeignClient(name = "user-service", url = "${USER_SERVICE_URL:http://user-service:8085}")
public interface UserClient {

    @GetMapping("/api/users/me")
    UserDTO getMyProfile();
}
