package tn.esprit.microservice.web_projet_offre;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;  // preferred
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.time.LocalDate;
@EnableDiscoveryClient
@EnableFeignClients  // Active OpenFeign
@SpringBootApplication
public class WebProjetOffreApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebProjetOffreApplication.class, args);
	}

	@Autowired
	private JobOfferRepository repository;

	@Bean
	ApplicationRunner init() {
		return args -> {

			// Vérifier si la base est vide
			if (repository.count() == 0) {

				repository.save(new JobOffer(
						null,
						"Java Developer",
						"Développement Spring Boot",
						"CDI",
						"2500DT",
						LocalDate.now(),
						"Java, Spring Boot"
				));

				repository.save(new JobOffer(
						null,
						"Frontend Developer",
						"Développement Angular",
						"Stage",
						"800DT",
						LocalDate.now(),
						"Angular, HTML, CSS"
				));

				repository.save(new JobOffer(
						null,
						"DevOps Engineer",
						"Gestion CI/CD",
						"CDD",
						"3000DT",
						LocalDate.now(),
						"Docker, Kubernetes"
				));
			}

			// affichage console
			repository.findAll().forEach(System.out::println);
		};
	}
}