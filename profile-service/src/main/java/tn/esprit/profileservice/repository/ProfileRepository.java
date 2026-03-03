package tn.esprit.profileservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profileservice.entity.Profile;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}