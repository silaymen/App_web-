package tn.esprit.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repo;

    @PostMapping
    public User create(@RequestBody User user){
        return repo.save(user);
    }

    @GetMapping
    public List<User> getAll(){
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id){
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id,@RequestBody User user){
        user.setId(id);
        return repo.save(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        repo.deleteById(id);
    }
}