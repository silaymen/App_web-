package tn.esprit.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}