package tn.esprit.microservice.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.microservice.userservice.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u left join u.roles r WHERE u.enabled = true " +
            "AND (:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:role IS NULL OR :role = '' OR r = :role) " +
            "GROUP BY u.id")
    java.util.List<User> searchUsers(@org.springframework.data.repository.query.Param("search") String search, @org.springframework.data.repository.query.Param("role") String role, org.springframework.data.domain.Sort sort);
}
