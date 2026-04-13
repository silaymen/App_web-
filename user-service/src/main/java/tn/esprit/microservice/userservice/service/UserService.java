package tn.esprit.microservice.userservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.microservice.userservice.dto.UserEvent;
import tn.esprit.microservice.userservice.model.User;
import tn.esprit.microservice.userservice.producer.UserEventProducer;
import tn.esprit.microservice.userservice.repository.UserRepository;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    private final UserRepository userRepository;
    private final UserEventProducer userEventProducer;

    @Transactional
    public User syncUser(Jwt jwt) {
        try {
            String id = jwt.getSubject();
            String username = jwt.getClaimAsString("preferred_username");
            String email = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");

            System.out.println("Syncing user from JWT: " + id + ", email: " + email);

            Collection<String> rolesList = new HashSet<>();
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof Collection) {
                rolesList = ((Collection<?>) realmAccess.get("roles")).stream()
                        .map(Object::toString)
                        .map(String::toUpperCase)
                        .map(role -> role.startsWith("ROLE_") ? role.replaceFirst("^ROLE_", "") : role)
                        .collect(Collectors.toSet());
            }

            if (rolesList.isEmpty()) {
                rolesList.add("USER");
            }

            User user = userRepository.findById(id).orElseGet(() -> User.builder().id(id).enabled(true).build());

            if (!user.isEnabled()) {
                System.out.println("User " + username + " was previously disabled. Re-enabling for successful Keycloak login.");
                user.setEnabled(true);
            }

            user.setUsername(username != null ? username : id);
            user.setEmail(email != null ? email : "no-email-" + id + "@ezlearning.tn");
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRoles(new HashSet<>(rolesList));

            User savedUser = userRepository.save(user);
            System.out.println("Stored user in local DB. Preparing RabbitMQ broadcast...");

            userEventProducer.sendUserEvent(UserEvent.builder()
                    .id(savedUser.getId())
                    .username(savedUser.getUsername())
                    .email(savedUser.getEmail())
                    .firstName(savedUser.getFirstName())
                    .lastName(savedUser.getLastName())
                    .roles(savedUser.getRoles())
                    .eventType("SYNCED")
                    .build());

            return savedUser;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR during syncUser: " + e.getMessage());
            e.printStackTrace();
            throw e; 
        }
    }

    @Transactional
    public void syncAllUsersFromKeycloak(String userToken) {
        String adminToken = getAdminToken();
        if (adminToken == null) {
            System.err.println("Could not get admin token, skipping sync");
            return;
        }

        String internalIssuerUri = issuerUri.replace("localhost:8180", "keycloak:8080");
        String keycloakUsersUrl = internalIssuerUri.replace("/realms/", "/admin/realms/") + "/users";
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Object>[]> response = restTemplate.exchange(
                    keycloakUsersUrl,
                    HttpMethod.GET,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>[]>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                for (Map<String, Object> kcUser : response.getBody()) {
                    String id = (String) kcUser.get("id");
                    String username = (String) kcUser.get("username");
                    String email = (String) kcUser.get("email");
                    String firstName = (String) kcUser.get("firstName");
                    String lastName = (String) kcUser.get("lastName");

                    User localUser = userRepository.findById(id).orElseGet(() -> User.builder().id(id).enabled(true).build());
                    
                    if (localUser.isEnabled()) {
                        // Prevent Duplicate Email / Username crashing the whole sync
                        java.util.Optional<User> existingEmail = userRepository.findByEmail(email);
                        if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) {
                            System.err.println("Skipping user " + id + " due to duplicate email: " + email);
                            continue;
                        }
                        java.util.Optional<User> existingUsername = userRepository.findByUsername(username != null ? username : id);
                        if (existingUsername.isPresent() && !existingUsername.get().getId().equals(id)) {
                            System.err.println("Skipping user " + id + " due to duplicate username: " + username);
                            continue;
                        }

                        localUser.setUsername(username != null ? username : id);
                        localUser.setEmail(email);
                        localUser.setFirstName(firstName);
                        localUser.setLastName(lastName);
                        if (localUser.getRoles() == null || localUser.getRoles().isEmpty()) {
                            localUser.setRoles(new HashSet<>(List.of("USER")));
                        }
                        userRepository.save(localUser);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to sync users from Keycloak. Fallback to local DB.");
        }
    }

    public List<User> getAllUsers(String search, String role, String sortBy, String direction) {
        String sortProperty = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "username";
        org.springframework.data.domain.Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC;
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(sortDirection, sortProperty);
        
        return userRepository.searchUsers(search, role, sort);
    }

    public void deleteUser(String id, String tokenValue) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);

        userEventProducer.sendUserEvent(UserEvent.builder()
                .id(id)
                .eventType("DELETED")
                .build());
    }

    public User updateUser(String id, User userDetails, String tokenValue) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        
        String adminToken = getAdminToken();
        if (adminToken != null) {
            String internalIssuerUri = issuerUri.replace("localhost:8180", "keycloak:8080");
            String keycloakUserUrl = internalIssuerUri.replace("/realms/", "/admin/realms/") + "/users/" + id;
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            java.util.Map<String, Object> updatePayload = new java.util.HashMap<>();
            updatePayload.put("firstName", userDetails.getFirstName());
            updatePayload.put("lastName", userDetails.getLastName());

            HttpEntity<java.util.Map<String, Object>> entity = new HttpEntity<>(updatePayload, headers);
            try {
                restTemplate.exchange(keycloakUserUrl, HttpMethod.PUT, entity, Void.class);
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Failed to update user in Keycloak.");
            }
        }
        User savedUser = userRepository.save(user);

        userEventProducer.sendUserEvent(UserEvent.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .roles(savedUser.getRoles())
                .eventType("UPDATED")
                .build());

        return savedUser;
    }

    private String getAdminToken() {
        String keycloakTokenUrl = issuerUri.replace("localhost:8180", "keycloak:8080").replace("realms/pi_Realm", "realms/master") + "/protocol/openid-connect/token";
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

        org.springframework.util.MultiValueMap<String, String> map = new org.springframework.util.LinkedMultiValueMap<>();
        map.add("client_id", "admin-cli");
        map.add("username", "admin");
        map.add("password", "admin");
        map.add("grant_type", "password");

        HttpEntity<org.springframework.util.MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    keycloakTokenUrl, 
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to fetch Keycloak master admin token. Registration sync will fail.");
        }
        return null;
    }
}
