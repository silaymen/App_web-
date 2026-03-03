package tn.esprit.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.profileservice.client.UserClient;
import tn.esprit.profileservice.entity.Profile;
import tn.esprit.profileservice.repository.ProfileRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository repo;
    private final UserClient userClient;

    // -------------------- CRUD --------------------

    @PostMapping
    public Profile create(@RequestBody Profile profile) {
        return repo.save(profile);
    }

    @GetMapping
    public List<Profile> getAll() {
        return repo.findAll();
    }

    @GetMapping("/profile/{id}")
    public Profile getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Profile update(@PathVariable Long id, @RequestBody Profile profile) {
        profile.setId(id);
        return repo.save(profile);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }

    // -------------------- Combined Response --------------------

    @GetMapping("/full/{userId}")
    public Map<String, Object> getFullProfile(@PathVariable Long userId) {

        Object user = userClient.getUserById(userId);

        Profile profile = repo.findAll()
                .stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("profile", profile);

        return response;
    }
}