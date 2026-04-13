# Configuration du Service Emploi du Temps

## Résumé des modifications

Le service `Gestion-EmploiDuTemps` a été configuré et intégré avec succès dans l'architecture microservices existante.

## 1. Configuration Backend (Gestion-EmploiDuTemps)

### 1.1 Fichiers modifiés

#### `pom.xml`
- Mise à jour vers Spring Boot 4.0.3
- Mise à jour vers Spring Cloud 2025.1.0
- Ajout des dépendances nécessaires (Eureka Client, Config Client, OpenFeign, MySQL)
- Configuration de Lombok

#### `application.properties`
```properties
spring.application.name=emploidutemps-service
server.port=8089

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/ezlearning_emploidutemps_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true

# Config Server
spring.config.import=optional:configserver:http://localhost:8888
```

#### `Dockerfile`
- Création d'un Dockerfile multi-stage pour optimiser la taille de l'image
- Exposition du port 8089

## 2. Configuration API Gateway

### 2.1 Routes ajoutées dans `api-gateway/src/main/resources/application.yml`

```yaml
- id: emploidutemps-service
  uri: lb://emploidutemps-service
  predicates:
    - Path=/seances/**
```

## 3. Configuration Docker Compose

### 3.1 Service ajouté dans `docker-compose.yml`

```yaml
emploidutemps-service:
  build:
    context: ./Gestion-EmploiDuTemps
    dockerfile: Dockerfile
  image: ezlearning/emploidutemps-service:latest
  container_name: emploidutemps-service
  ports:
    - "8089:8089"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/ezlearning_emploidutemps_db?createDatabaseIfNotExist=true
    - SPRING_DATASOURCE_USERNAME=root
    - SPRING_DATASOURCE_PASSWORD=root
    - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
```

## 4. Configuration Frontend (Angular)

### 4.1 Nouveaux fichiers créés

#### `frontend/src/app/core/models/seance.model.ts`
- Interface TypeScript pour le modèle Seance
- Interface Page pour la pagination

#### `frontend/src/app/core/services/seance.service.ts`
- Service Angular pour les appels API vers le backend
- Méthodes: getAll, getById, searchByClasse, searchByEnseignant, create, update, delete

#### `frontend/src/app/features/backoffice/seances-management.component.ts`
- Composant standalone pour la gestion des séances
- Interface CRUD complète (Create, Read, Update, Delete)
- Recherche par classe et par enseignant
- Design moderne avec glassmorphism

### 4.2 Fichiers modifiés

#### `frontend/src/environments/environment.ts` et `environment.development.ts`
- Ajout de `apiGatewayUrl: 'http://localhost:8000'`

#### `frontend/src/app/features/backoffice/backoffice.component.ts`
- Ajout d'un système d'onglets pour naviguer entre Formations et Emploi du Temps
- Intégration du composant SeancesManagementComponent

## 5. Architecture des Endpoints

### Backend (via API Gateway)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/seances` | Récupérer toutes les séances |
| GET | `/seances/{id}` | Récupérer une séance par ID |
| POST | `/seances` | Créer une nouvelle séance |
| PUT | `/seances/{id}` | Mettre à jour une séance |
| DELETE | `/seances/{id}` | Supprimer une séance |
| GET | `/seances/search/classe?classe={classe}&page={page}&size={size}` | Rechercher par classe |
| GET | `/seances/search/enseignant?nom={nom}&page={page}&size={size}` | Rechercher par enseignant |

## 6. Démarrage des services

### En local (développement)

1. Démarrer MySQL sur le port 3306
2. Démarrer Eureka Server: `cd eureka-server && mvn spring-boot:run`
3. Démarrer Config Server: `cd config-server && mvn spring-boot:run`
4. Démarrer Formation Service: `cd formation-service && mvn spring-boot:run`
5. Démarrer Emploi du Temps Service: `cd Gestion-EmploiDuTemps && mvn spring-boot:run`
6. Démarrer API Gateway: `cd api-gateway && mvn spring-boot:run`
7. Démarrer Frontend: `cd frontend && npm start`

### Avec Docker Compose

```bash
docker-compose up --build
```

## 7. URLs d'accès

- Frontend: http://localhost:4200
- API Gateway: http://localhost:8000
- Eureka Dashboard: http://localhost:8761
- Formation Service: http://localhost:8088
- Emploi du Temps Service: http://localhost:8089
- Config Server: http://localhost:8888

## 8. Base de données

Le service utilise MySQL avec la base de données `ezlearning_emploidutemps_db` qui sera créée automatiquement au démarrage.

### Structure de la table Seance

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Clé primaire auto-incrémentée |
| date | DATE | Date de la séance |
| heure_debut | TIME | Heure de début |
| heure_fin | TIME | Heure de fin |
| enseignant | VARCHAR | Nom de l'enseignant |
| matiere | VARCHAR | Nom de la matière |
| classe | VARCHAR | Nom de la classe |
| salle | VARCHAR | Numéro de salle |
| type_seance | VARCHAR | Type (Cours, TD, TP, Examen) |

## 9. Notes importantes

- Le service formation-service n'a pas été modifié (comme demandé)
- Le service emploidutemps-service utilise le même pattern que formation-service
- L'intégration frontend utilise des composants standalone Angular
- Le design est cohérent avec le reste de l'application
- CORS est configuré dans l'API Gateway pour accepter les requêtes depuis http://localhost:4200
