package com.esprit.microservice.gestionemploidutemps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalTime;
@EnableDiscoveryClient
@EnableFeignClients
@SpringBootApplication
public class GestionEmploiDuTempsApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionEmploiDuTempsApplication.class, args);
    }

    @Autowired
    private SeanceRepository seanceRepository;

    @Bean
    ApplicationRunner init() {
        return args -> {
            // Vérifier si la table est vide
            if (seanceRepository.count() == 0) {
                seanceRepository.save(new Seance(LocalDate.of(2026, 3, 3),
                        LocalTime.of(8, 0),
                        LocalTime.of(10, 0),
                        "Mme Dupont",
                        "Maths",
                        "1A",
                        "101",
                        "Cours"));
                seanceRepository.save(new Seance(LocalDate.of(2026, 3, 3),
                        LocalTime.of(10, 0),
                        LocalTime.of(12, 0),
                        "Mr. Ben Ali",
                        "Physique",
                        "1B",
                        "102",
                        "Cours"));
                seanceRepository.save(new Seance(LocalDate.of(2026, 3, 4),
                        LocalTime.of(8, 0),
                        LocalTime.of(10, 0),
                        "Mme Trabelsi",
                        "Français",
                        "2A",
                        "201",
                        "Cours"));
            }

            // Affichage pour vérification
            seanceRepository.findAll().forEach(System.out::println);
        };
    }
}