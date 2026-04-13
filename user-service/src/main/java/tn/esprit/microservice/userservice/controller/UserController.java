package tn.esprit.microservice.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.userservice.model.User;
import tn.esprit.microservice.userservice.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/public")
    public String publicEndpoint() {
        return "This is a public endpoint open to anyone.";
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            User syncedUser = userService.syncUser(jwt);
            return ResponseEntity.ok(syncedUser);
        }
        return ResponseEntity.status(401).build();
    }

    // Admin Endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction,
            Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            String tokenValue = jwtToken.getToken().getTokenValue();
            userService.syncAllUsersFromKeycloak(tokenValue);
        }
        return userService.getAllUsers(search, role, sortBy, direction);
    }

    @PutMapping("/admin/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user, Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            String tokenValue = jwtToken.getToken().getTokenValue();
            return ResponseEntity.ok(userService.updateUser(id, user, tokenValue));
        }
        return ResponseEntity.ok(userService.updateUser(id, user, null));
    }

    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            String tokenValue = jwtToken.getToken().getTokenValue();
            userService.deleteUser(id, tokenValue);
        } else {
            userService.deleteUser(id, null);
        }
        return ResponseEntity.noContent().build();
    }
}
