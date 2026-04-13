# Configuration du Service Job Offre

## Résumé des modifications

Le service `GES_JobOffre` a été configuré et intégré avec succès dans l'architecture microservices.

## 1. Configuration Backend (GES_JobOffre)

### 1.1 Fichiers modifiés

#### `pom.xml`
- Mise à jour vers Spring Boot 4.0.3
- Mise à jour vers Spring Cloud 2025.1.0
- Remplacement de H2 par MySQL
- Ajout de Lombok

#### `application.properties`
```properties
spring.application.name=joboffre-service
server.port=8090

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/ezlearning_joboffre_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Config Server
spring.config.import=optional:configserver:http://localhost:8888
```

#### `Dockerfile`
- Création d'un Dockerfile multi-stage
- Exposition du port 8090

## 2. Configuration API Gateway

### 2.1 Route ajoutée

```yaml
- id: joboffre-service
  uri: lb://joboffre-service
  predicates:
    - Path=/joboffers/**
```

## 3. Configuration Docker Compose

### 3.1 Service ajouté

```yaml
joboffre-service:
  build:
    context: ./GES_JobOffre
    dockerfile: Dockerfile
  image: ezlearning/joboffre-service:latest
  container_name: joboffre-service
  ports:
    - "8090:8090"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/ezlearning_joboffre_db?createDatabaseIfNotExist=true
    - SPRING_DATASOURCE_USERNAME=root
    - SPRING_DATASOURCE_PASSWORD=root
    - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
```

## 4. Configuration Frontend (Angular)

### 4.1 Nouveaux fichiers créés

#### `frontend/src/app/core/models/joboffre.model.ts`
- Interface TypeScript pour JobOffre

#### `frontend/src/app/core/services/joboffre.service.ts`
- Service Angular pour les appels API
- Méthodes: getAll, getById, create, update, delete

#### `frontend/src/app/features/backoffice/joboffres-management.component.ts`
- Composant standalone pour la gestion des offres d'emploi
- Interface CRUD complète
- Design moderne avec badges de type de contrat

### 4.2 Fichiers modifiés

#### `frontend/src/app/features/backoffice/backoffice.component.ts`
- Ajout d'un troisième onglet "💼 Offres d'Emploi"
- Intégration du composant JobOffresManagementComponent

## 5. Architecture des Endpoints

### Backend (via API Gateway)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/joboffers` | Récupérer toutes les offres |
| GET | `/joboffers/{id}` | Récupérer une offre par ID |
| POST | `/joboffers` | Créer une nouvelle offre |
| PUT | `/joboffers/{id}` | Mettre à jour une offre |
| DELETE | `/joboffers/{id}` | Supprimer une offre |

## 6. Structure de la table JobOffer

| Colonne | Type | Description |
|---------|------|-------------|
| id_joboffer | BIGINT | Clé primaire auto-incrémentée |
| name_joboffer | VARCHAR | Titre du poste |
| description_offer | TEXT | Description de l'offre |
| contrat_typeoffer | VARCHAR | Type de contrat (CDI, CDD, Stage, Freelance) |
| offer_salary | VARCHAR | Salaire proposé |
| offer_date | TIMESTAMP | Date de publication |
| skills_offer | TEXT | Compétences requises |

## 7. URLs d'accès

- **Job Offre Service**: http://localhost:8090
- **Via API Gateway**: http://localhost:8000/joboffers
- **Frontend Backoffice**: http://localhost:4200/admin (onglet Offres d'Emploi)

## 8. Tests

### Test via curl

```bash
# Récupérer toutes les offres
curl http://localhost:8000/joboffers

# Créer une offre
curl -X POST http://localhost:8000/joboffers \
  -H "Content-Type: application/json" \
  -d '{
    "nameJoboffer": "Développeur Full Stack",
    "descriptionOffer": "Nous recherchons un développeur Full Stack expérimenté",
    "contratTypeoffer": "CDI",
    "offerSalary": "45000-55000€",
    "offerDate": "2026-04-11T10:00:00.000Z",
    "skillsOffer": "Java, Spring Boot, Angular, Docker"
  }'
```

## 9. Démarrage

### Avec Docker Compose

```bash
cd C:\Users\lenovo\Desktop\GES_FORMATION_ET_EMPLOI
docker-compose build
docker-compose up -d
```

### Vérification

```bash
# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f joboffre-service

# Vérifier dans Eureka
# Ouvrir http://localhost:8761
# Vous devriez voir JOBOFFRE-SERVICE enregistré
```

## 10. Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (8000)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
┌───────▼────┐ ┌────▼─────┐ ┌───▼──────┐ ┌──▼────────┐
│ Formation  │ │ Emploi   │ │ Job      │ │ Eureka    │
│ (8088)     │ │ (8089)   │ │ (8090)   │ │ (8761)    │
└────────────┘ └──────────┘ └──────────┘ └───────────┘
        │            │            │
        └────────────┴────────────┘
                     │
              ┌──────▼──────┐
              │   MySQL     │
              │   (3307)    │
              └─────────────┘
```

## 11. Services Disponibles

1. ✅ **Formation Service** (port 8088)
2. ✅ **Emploi du Temps Service** (port 8089)
3. ✅ **Job Offre Service** (port 8090)
4. ✅ **API Gateway** (port 8000)
5. ✅ **Eureka Server** (port 8761)
6. ✅ **Config Server** (port 8888)
7. ✅ **MySQL** (port 3307)
8. ✅ **RabbitMQ** (port 5672, UI: 15672)

Tous les services sont maintenant configurés et prêts à être déployés! 🚀
