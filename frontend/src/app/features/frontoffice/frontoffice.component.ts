import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { FormationService } from '../../core/services/formation.service';
import { SeanceService } from '../../core/services/seance.service';
import { JobOffreService } from '../../core/services/joboffre.service';
import { CertificationService } from '../../core/services/certification.service';
import { Formation } from '../../core/models/formation.model';
import { Seance } from '../../core/models/seance.model';
import { JobOffre } from '../../core/models/joboffre.model';
import { Certification } from '../../core/models/certification.model';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hero mb-5 text-center">
      <h1 class="hero-title">Discover Your Next <span class="text-accent">Skill</span></h1>
      <p class="hero-subtitle text-muted">Join our premium formations, check schedules, job offers, and certifications.</p>
    </div>

    <div class="container">
      <!-- Navigation Tabs -->
      <div class="tabs-container mb-4">
        <button 
          class="tab-btn" 
          [class.active]="activeSection === 'formations'"
          (click)="activeSection = 'formations'">
          📚 Formations
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeSection === 'schedule'"
          (click)="activeSection = 'schedule'">
          📅 Emploi du Temps
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeSection === 'jobs'"
          (click)="activeSection = 'jobs'">
          💼 Offres d'Emploi
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeSection === 'certs'"
          (click)="activeSection = 'certs'; loadCertifications()">
          🏅 Certifications
        </button>
      </div>

      <!-- Formations Section -->
      <div *ngIf="activeSection === 'formations'">
        <div class="filters glass-panel mb-4 filters-row">
          <div class="form-group mb-0 search-bar">
            <label class="form-label fo-filter-label">Search by title</label>
            <input type="text" class="form-control" placeholder="Type to filter…" [(ngModel)]="searchQuery"
              (ngModelChange)="scheduleFormationFilter()" autocomplete="off">
          </div>
          <div class="form-group mb-0 filter-category">
            <label class="form-label fo-filter-label">Category</label>
            <select class="form-control" [(ngModel)]="selectedCategory" (ngModelChange)="applyFormationFilters()">
              <option value="">All Categories</option>
              <option value="IT">IT & Tech</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div class="form-group mb-0 max-price-filter">
            <label class="form-label fo-filter-label">Max price</label>
            <input type="number" min="0" step="0.01" class="form-control" placeholder="No limit"
              [(ngModel)]="maxPriceInput" (ngModelChange)="scheduleFormationFilter()">
          </div>
          <button type="button" class="btn btn-primary align-self-end" (click)="loadFormations()">Reset</button>
        </div>

        <div class="grid" *ngIf="formations.length > 0; else noFormations">
          <div class="glass-card formation-card" *ngFor="let form of formations">
            <div class="card-header d-flex justify-between align-center mb-2">
              <span class="badge badge-purple">{{form.categorie}}</span>
              <span class="price">\${{form.prix}}</span>
            </div>
            <h3 class="card-title mb-1">{{form.titre}}</h3>
            <p class="card-desc text-muted mb-3">{{form.description}}</p>
            <div class="card-footer">
              <span class="status-active" *ngIf="form.active">✓ Active</span>
              <button class="btn btn-primary btn-sm">Enroll Now</button>
            </div>
          </div>
        </div>

        <ng-template #noFormations>
          <div class="text-center text-muted mt-4 p-4 glass-panel">
            <p>📚 No formations available at the moment.</p>
          </div>
        </ng-template>
      </div>

      <!-- Schedule Section -->
      <div *ngIf="activeSection === 'schedule'">
        <div class="filters glass-panel mb-4 d-flex justify-between align-center">
          <div class="form-group mb-0 search-bar">
            <input type="text" class="form-control" placeholder="Search by class..." [(ngModel)]="searchClasse" (keyup.enter)="searchSeances()">
          </div>
          <div class="form-group mb-0 search-bar">
            <input type="text" class="form-control" placeholder="Search by teacher..." [(ngModel)]="searchEnseignant" (keyup.enter)="searchSeances()">
          </div>
          <button class="btn btn-primary" (click)="loadSeances()">Reset</button>
        </div>

        <div class="schedule-grid" *ngIf="seances.length > 0; else noSeances">
          <div class="glass-card schedule-card" *ngFor="let seance of seances">
            <div class="schedule-header">
              <span class="badge" [class]="'badge-' + seance.typeSeance.toLowerCase()">{{seance.typeSeance}}</span>
              <span class="schedule-date">{{seance.date | date:'dd/MM/yyyy'}}</span>
            </div>
            <h3 class="card-title mb-2">{{seance.matiere}}</h3>
            <div class="schedule-details">
              <div class="detail-item">
                <span class="icon">👨‍🏫</span>
                <span>{{seance.enseignant}}</span>
              </div>
              <div class="detail-item">
                <span class="icon">🎓</span>
                <span>{{seance.classe}}</span>
              </div>
              <div class="detail-item">
                <span class="icon">🏢</span>
                <span>Salle {{seance.salle}}</span>
              </div>
              <div class="detail-item">
                <span class="icon">⏰</span>
                <span>{{seance.heureDebut}} - {{seance.heureFin}}</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noSeances>
          <div class="text-center text-muted mt-4 p-4 glass-panel">
            <p>📅 No scheduled sessions available.</p>
          </div>
        </ng-template>
      </div>

      <!-- Jobs Section -->
      <div *ngIf="activeSection === 'jobs'">
        <div class="jobs-list" *ngIf="jobOffres.length > 0; else noJobs">
          <div class="glass-card job-card" *ngFor="let job of jobOffres">
            <div class="job-header">
              <div>
                <h3 class="card-title mb-1">{{job.nameJoboffer}}</h3>
                <span class="badge badge-contract" [class]="'badge-' + job.contratTypeoffer.toLowerCase()">
                  {{job.contratTypeoffer}}
                </span>
              </div>
              <div class="job-salary">{{job.offerSalary}}</div>
            </div>
            <p class="card-desc text-muted mb-3">{{job.descriptionOffer}}</p>
            <div class="job-skills mb-3">
              <span class="skill-tag" *ngFor="let skill of job.skillsOffer.split(',')">
                {{skill.trim()}}
              </span>
            </div>
            <div class="job-footer d-flex justify-between align-center">
              <span class="job-date text-muted">📅 {{job.offerDate | date:'dd/MM/yyyy'}}</span>
              <button class="btn btn-primary btn-sm">Apply Now</button>
            </div>
          </div>
        </div>

        <ng-template #noJobs>
          <div class="text-center text-muted mt-4 p-4 glass-panel">
            <p>💼 No job offers available at the moment.</p>
          </div>
        </ng-template>
      </div>

      <!-- Certifications (lecture seule — création / édition dans Admin Desk) -->
      <div *ngIf="activeSection === 'certs'">
        <p class="text-muted mb-3" style="font-size:0.95rem;">
          Catalogue des certifications (API via la passerelle). Pour ajouter ou modifier, utilisez <strong>Admin Desk</strong> → onglet Certifications.
        </p>
        <div class="jobs-list" *ngIf="certifications.length > 0; else noCerts">
          <div class="glass-card job-card cert-card" *ngFor="let c of certifications">
            <div class="job-header">
              <div>
                <h3 class="card-title mb-1">{{ c.name }}</h3>
                <span class="badge badge-purple" *ngIf="c.version">{{ c.version }}</span>
              </div>
            </div>
            <p class="card-desc text-muted mb-2" *ngIf="c.description">{{ c.description }}</p>
            <div class="job-footer d-flex justify-between align-center flex-wrap gap-2">
              <span class="job-date text-muted" *ngIf="c.issueDate">📅 {{ c.issueDate | date:'dd/MM/yyyy' }} → {{ c.expiryDate | date:'dd/MM/yyyy' }}</span>
              <span class="text-muted" *ngIf="c.ownerEmail" style="font-size:0.9rem;">✉️ {{ c.ownerEmail }}</span>
            </div>
          </div>
        </div>
        <ng-template #noCerts>
          <div class="text-center text-muted mt-4 p-4 glass-panel">
            <p>🏅 No certifications listed yet.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      padding: 4rem 1rem;
      background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-size: 1.2rem;
      max-width: 700px;
      margin: 0 auto;
    }
    
    /* Tabs */
    .tabs-container {
      display: flex;
      gap: 1rem;
      border-bottom: 2px solid var(--glass-border);
      padding-bottom: 0;
    }
    .tab-btn {
      background: transparent;
      border: none;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-muted);
      border-bottom: 3px solid transparent;
      transition: var(--transition);
      margin-bottom: -2px;
    }
    .tab-btn:hover {
      color: var(--text-primary);
    }
    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    
    /* Filters */
    .filters {
      padding: 1.5rem;
    }
    .filters-row {
      display: grid;
      grid-template-columns: minmax(160px, 1fr) minmax(140px, 200px) minmax(110px, 140px) auto;
      gap: 1rem 1.25rem;
      align-items: end;
    }
    .fo-filter-label {
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.85rem;
    }
    .search-bar { min-width: 0; }
    .max-price-filter .form-control { width: 100%; }
    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr 1fr;
      }
      .filters-row .btn-primary {
        grid-column: 1 / -1;
        justify-self: start;
      }
    }
    
    /* Formations Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .formation-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }
    .formation-card:hover {
      transform: translateY(-5px);
    }
    
    /* Badges */
    .badge {
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .badge-purple {
      background: rgba(139, 92, 246, 0.2);
      color: var(--accent);
    }
    .badge-cours {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
    .badge-td {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    .badge-tp {
      background: rgba(168, 85, 247, 0.2);
      color: #a78bfa;
    }
    .badge-examen {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    .badge-cdi {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    .badge-cdd {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
    .badge-stage {
      background: rgba(168, 85, 247, 0.2);
      color: #a78bfa;
    }
    .badge-freelance {
      background: rgba(251, 146, 60, 0.2);
      color: #fb923c;
    }
    
    .price {
      font-weight: 700;
      font-size: 1.3rem;
      color: var(--success);
    }
    .card-title { 
      font-size: 1.3rem;
      font-weight: 600;
    }
    .card-desc { 
      font-size: 0.95rem;
      flex-grow: 1;
      line-height: 1.6;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .status-active {
      color: var(--success);
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    /* Schedule Grid */
    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    .schedule-card {
      padding: 1.5rem;
    }
    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .schedule-date {
      font-weight: 600;
      color: var(--text-muted);
    }
    .schedule-details {
      display: grid;
      gap: 0.8rem;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }
    .icon {
      font-size: 1.2rem;
    }
    
    /* Jobs List */
    .jobs-list {
      display: grid;
      gap: 1.5rem;
    }
    .job-card {
      padding: 2rem;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .job-salary {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--success);
    }
    .job-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-tag {
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent);
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .job-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border);
    }
    .job-date {
      font-size: 0.9rem;
    }
    
    /* Buttons */
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    .w-100 { width: 100%; }
    .mb-0 { margin-bottom: 0 !important; }
  `]
})
export class FrontofficeComponent implements OnInit, OnDestroy {
  private formationService = inject(FormationService);
  private seanceService = inject(SeanceService);
  private jobOffreService = inject(JobOffreService);
  private certificationService = inject(CertificationService);

  activeSection: 'formations' | 'schedule' | 'jobs' | 'certs' = 'formations';

  /** Active formations from API (catalog source). */
  private formationsCatalog: Formation[] = [];
  formations: Formation[] = [];
  seances: Seance[] = [];
  jobOffres: JobOffre[] = [];
  certifications: Certification[] = [];

  searchQuery: string = '';
  selectedCategory: string = '';
  maxPriceInput: number | null = null;
  searchClasse: string = '';
  searchEnseignant: string = '';

  private readonly formationFilterBus = new Subject<void>();
  private formationFilterSub: Subscription;

  constructor() {
    this.formationFilterSub = this.formationFilterBus.pipe(debounceTime(300)).subscribe(() => this.applyFormationFilters());
  }

  ngOnInit() {
    this.loadFormations();
    this.loadSeances();
    this.loadJobOffres();
    this.loadCertifications();
  }

  ngOnDestroy() {
    this.formationFilterSub.unsubscribe();
  }

  scheduleFormationFilter() {
    this.formationFilterBus.next();
  }

  loadFormations() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.maxPriceInput = null;
    this.formationService.getActive(0, 100).subscribe({
      next: (data) => {
        this.formationsCatalog = data.content ?? [];
        this.applyFormationFilters();
      },
      error: (err) => console.error(err)
    });
  }

  /** Local filters on the active catalog: title + category + max price work together, no Enter. */
  applyFormationFilters() {
    const q = (this.searchQuery ?? '').trim().toLowerCase();
    const cat = (this.selectedCategory ?? '').trim();
    const rawMax = this.maxPriceInput;
    const maxP =
      rawMax === null || rawMax === undefined || (typeof rawMax === 'number' && Number.isNaN(rawMax))
        ? null
        : rawMax;

    this.formations = this.formationsCatalog.filter((f) => {
      const titre = (f.titre ?? '').toLowerCase();
      if (q && !titre.includes(q)) {
        return false;
      }
      if (cat && f.categorie !== cat) {
        return false;
      }
      if (maxP !== null && maxP >= 0) {
        const prix = f.prix != null ? Number(f.prix) : NaN;
        if (Number.isNaN(prix) || prix > maxP) {
          return false;
        }
      }
      return true;
    });
  }

  loadSeances() {
    this.searchClasse = '';
    this.searchEnseignant = '';
    this.seanceService.getAll().subscribe({
      next: (data) => this.seances = data,
      error: (err) => console.error(err)
    });
  }

  searchSeances() {
    if (this.searchClasse) {
      this.seanceService.searchByClasse(this.searchClasse).subscribe({
        next: (data) => this.seances = data.content,
        error: (err) => console.error(err)
      });
    } else if (this.searchEnseignant) {
      this.seanceService.searchByEnseignant(this.searchEnseignant).subscribe({
        next: (data) => this.seances = data.content,
        error: (err) => console.error(err)
      });
    }
  }

  loadJobOffres() {
    this.jobOffreService.getAll().subscribe({
      next: (data) => this.jobOffres = data,
      error: (err) => console.error(err)
    });
  }

  loadCertifications() {
    this.certificationService.getCertifications('', 'id', 'asc').subscribe({
      next: (data) => (this.certifications = data ?? []),
      error: (err) => {
        console.error(err);
        this.certifications = [];
      }
    });
  }
}
