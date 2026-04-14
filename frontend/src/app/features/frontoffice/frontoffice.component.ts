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
import { HackathonService } from '../../core/services/hackathon.service';
import { Hackathon } from '../../core/models/hackathon.model';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="front-office-wrapper">
      <!-- Hero Section -->
      <section class="hero-section text-center animate-fade-in">
        <div class="hero-content">
          <h1 class="hero-title">Elevate Your <span class="highlight">Professional</span> Journey</h1>
          <p class="hero-subtitle">Access world-class formations, real-time schedules, and elite job opportunities in one premium platform.</p>
          <div class="hero-actions d-flex justify-center gap-3">
            <button class="btn btn-primary btn-glow" (click)="activeSection = 'formations'">Browse Catalog</button>
            <button class="btn btn-outline" (click)="activeSection = 'jobs'">View Jobs</button>
          </div>
        </div>
        <div class="hero-bg-accent"></div>
      </section>

      <div class="container main-content animate-fade-in" style="animation-delay: 0.3s">
        <!-- Modern Navigation Pills -->
        <div class="pills-nav-container mb-5">
          <div class="pills-nav glass-panel">
            <button 
              class="pill-btn" 
              [class.active]="activeSection === 'formations'"
              (click)="activeSection = 'formations'">
              <span class="icon">📚</span> Formations
            </button>
            <button 
              class="pill-btn" 
              [class.active]="activeSection === 'schedule'"
              (click)="activeSection = 'schedule'">
              <span class="icon">📅</span> Schedule
            </button>
            <button 
              class="pill-btn" 
              [class.active]="activeSection === 'jobs'"
              (click)="activeSection = 'jobs'">
              <span class="icon">💼</span> Jobs
            </button>
            <button 
              class="pill-btn" 
              [class.active]="activeSection === 'certs'"
              (click)="activeSection = 'certs'; loadCertifications()">
              <span class="icon">🏅</span> Certs
            </button>
            <button 
              class="pill-btn" 
              [class.active]="activeSection === 'hackathons'"
              (click)="activeSection = 'hackathons'; loadHackathons()">
              <span class="icon">🚀</span> Hackathons
            </button>
          </div>
        </div>

        <!-- Formations Section -->
        <div *ngIf="activeSection === 'formations'" class="section-fade-in">
          <div class="control-center glass-panel mb-5">
            <div class="filter-group group-grow">
              <label>Search Course</label>
              <input type="text" class="form-control" placeholder="Search by title..." [(ngModel)]="searchQuery" (ngModelChange)="scheduleFormationFilter()">
            </div>
            <div class="filter-group group-fixed">
              <label>Category</label>
              <select class="form-control" [(ngModel)]="selectedCategory" (ngModelChange)="applyFormationFilters()">
                <option value="">All Fields</option>
                <option value="IT">IT & Architecture</option>
                <option value="Business">Business Strategy</option>
                <option value="Design">Visual Design</option>
                <option value="Marketing">Growth Marketing</option>
              </select>
            </div>
            <div class="filter-group group-fixed">
              <label>Max Budget</label>
              <div class="price-input-wrapper">
                <span class="currency">$</span>
                <input type="number" class="form-control" placeholder="0.00" [(ngModel)]="maxPriceInput" (ngModelChange)="scheduleFormationFilter()">
              </div>
            </div>
            <button class="btn btn-outline reset-btn" (click)="loadFormations()">Reset</button>
          </div>

          <div class="grid" *ngIf="formations.length > 0; else noFormations">
            <div class="glass-card premium-hover" *ngFor="let form of formations">
              <div class="card-brand-strip">
                <span class="badge badge-primary">{{form.categorie}}</span>
                <div class="highlight-text">\${{form.prix}}</div>
              </div>
              <div class="card-content-stack">
                <h3 class="card-title">{{form.titre}}</h3>
                <p class="card-description">{{form.description}}</p>
              </div>
              <div class="card-footer-strip">
                <div class="status-indicator">
                  <span class="dot-pulse green"></span> Enrolling
                </div>
                <button class="btn btn-glow btn-sm">Enroll Now</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Section -->
        <div *ngIf="activeSection === 'schedule'" class="section-fade-in">
          <div class="control-center glass-panel mb-5">
             <div class="filter-group group-grow">
               <label>Class ID</label>
               <input type="text" class="form-control" placeholder="Search Class..." [(ngModel)]="searchClasse" (keyup.enter)="searchSeances()">
             </div>
             <div class="filter-group group-grow">
               <label>Professor</label>
               <input type="text" class="form-control" placeholder="Search Teacher..." [(ngModel)]="searchEnseignant" (keyup.enter)="searchSeances()">
             </div>
             <button class="btn btn-primary btn-glow" (click)="searchSeances()">Apply Filter</button>
          </div>
          <div class="grid" *ngIf="seances.length > 0; else noSeances">
            <div class="glass-card premium-hover" *ngFor="let seance of seances">
              <div class="card-brand-strip">
                <span class="badge badge-primary">{{seance.typeSeance}}</span>
                <div class="highlight-text">{{seance.date | date:'MMM dd'}}</div>
              </div>
              <div class="card-content-stack">
                <h3 class="card-title">{{seance.matiere}}</h3>
                <div class="info-cloud">
                  <span class="info-tag">🏢 Room {{seance.salle}}</span>
                  <span class="info-tag">👨‍🏫 {{seance.enseignant}}</span>
                  <span class="info-tag">👥 {{seance.classe}}</span>
                </div>
              </div>
              <div class="card-footer-strip">
                <div class="status-indicator">
                  <span class="dot-pulse blue"></span> {{seance.heureDebut}} - {{seance.heureFin}}
                </div>
                <button class="btn btn-outline btn-sm">Join Class</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Jobs Section -->
        <div *ngIf="activeSection === 'jobs'" class="section-fade-in">
          <div class="grid" *ngIf="jobOffres.length > 0; else noJobs">
            <div class="glass-card premium-hover" *ngFor="let job of jobOffres">
              <div class="card-brand-strip">
                <span class="badge badge-primary">{{job.contratTypeoffer}}</span>
                <div class="highlight-text">{{job.offerSalary}} DT</div>
              </div>
              <div class="card-content-stack">
                <h3 class="card-title">{{job.nameJoboffer}}</h3>
                <p class="card-description">{{job.descriptionOffer}}</p>
                <div class="info-cloud">
                  <span class="skill-pill" *ngFor="let skill of job.skillsOffer.split(',')">{{skill.trim()}}</span>
                </div>
              </div>
              <div class="card-footer-strip">
                <div class="status-indicator">
                   Posted: {{job.offerDate | date:'shortDate'}}
                </div>
                <button class="btn btn-glow btn-sm">Apply Now</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Certs Section -->
        <div *ngIf="activeSection === 'certs'" class="section-fade-in">
          <div class="grid">
            <div class="glass-card premium-hover" *ngFor="let c of certifications">
              <div class="card-brand-strip">
                <span class="badge badge-primary">CERTIFICATION</span>
                <div class="highlight-text">LVL {{c.version}}</div>
              </div>
              <div class="card-content-stack">
                <h3 class="card-title">{{c.name}}</h3>
                <p class="card-description">{{c.description}}</p>
                <div class="info-cloud">
                  <span class="info-tag">🏅 Verified Status</span>
                  <span class="info-tag">📅 Lifetime Validity</span>
                </div>
              </div>
              <div class="card-footer-strip">
                <div class="status-indicator">
                  <span class="dot-pulse purple"></span> Official
                </div>
                <button class="btn btn-glow btn-sm">Enroll More</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Hackathons Section -->
        <div *ngIf="activeSection === 'hackathons'" class="section-fade-in">
          <div class="grid" *ngIf="hackathons.length > 0; else noHackathons">
            <div class="glass-card premium-hover" *ngFor="let h of hackathons">
              <div class="card-brand-strip">
                <span class="badge badge-primary">{{h.category}}</span>
                <div class="highlight-text">LIVE</div>
              </div>
              <div class="card-content-stack">
                <h3 class="card-title">{{h.title}}</h3>
                <p class="card-description">{{h.description}}</p>
                <div class="info-cloud">
                  <span class="info-tag">📍 {{h.location}}</span>
                  <span class="info-tag">📅 {{h.startDate | date:'mediumDate'}}</span>
                </div>
              </div>
              <div class="card-footer-strip">
                <div class="status-indicator">
                  <span class="dot-pulse green"></span> Registration Open
                </div>
                <button class="btn btn-glow btn-sm">Join Event</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fallback templates -->
        <ng-template #noFormations><div class="empty-state glass-panel">📚 No courses found matching your criteria.</div></ng-template>
        <ng-template #noSeances><div class="empty-state glass-panel">📅 No scheduled sessions found.</div></ng-template>
        <ng-template #noJobs><div class="empty-state glass-panel">💼 No job opportunities at moment.</div></ng-template>
        <ng-template #noHackathons><div class="empty-state glass-panel">🚀 No hackathons scheduled yet.</div></ng-template>
      </div>
    </div>
  `,
  styles: [`
    .front-office-wrapper {
      padding-bottom: 5rem;
    }
    
    /* Hero Section */
    .hero-section {
      position: relative;
      padding: 8rem 1rem 12rem;
      background: url('/assets/hero_bg.png') center/cover no-repeat;
      overflow: hidden;
      margin-top: -8rem;
    }
    .hero-section::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(2,6,23,0.4), var(--bg-primary));
    }
    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 900px;
      margin: 0 auto;
    }
    .hero-title {
      font-size: 5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 2rem;
      letter-spacing: -2px;
    }
    .hero-title .highlight {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.4rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 3rem;
      line-height: 1.6;
    }

    /* Main Content */
    .main-content {
      margin-top: -6rem;
      position: relative;
      z-index: 20;
    }

    /* Pills Navigation */
    .pills-nav-container {
      display: flex;
      justify-content: center;
    }
    .pills-nav {
      display: flex;
      padding: 0.5rem;
      border-radius: 100px;
      gap: 0.5rem;
    }
    .pill-btn {
      background: transparent;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 100px;
      color: var(--text-muted);
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pill-btn:hover {
      color: var(--text-main);
      background: rgba(255,255,255,0.05);
    }
    .pill-btn.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    /* UNIFIED GRID SYSTEM (2 or 3 per line) */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 2rem;
      width: 100%;
    }
    @media (min-width: 1200px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 800px) and (max-width: 1199px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* UNIFIED GLASS CARD */
    .glass-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .glass-card:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255,255,255,0.2);
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }

    /* Control Center (Filters) */
    .control-center {
      padding: 1.5rem 2.5rem;
      display: flex;
      gap: 2rem;
      align-items: flex-end;
    }
    .filter-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
      letter-spacing: 1px;
    }
    .group-grow { flex: 1; }
    .group-fixed { width: 180px; }

    /* Card Components */
    .card-brand-strip {
      padding: 1.5rem 2rem 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-primary {
      background: rgba(99, 102, 241, 0.1);
      color: #818cf8;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0.3rem 0.8rem;
      border-radius: 6px;
    }
    .highlight-text {
      font-size: 1.4rem;
      font-weight: 800;
      color: #10b981;
    }
    .card-content-stack {
      padding: 1.5rem 2rem;
      flex-grow: 1;
    }
    .card-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 0.8rem;
    }
    .card-description {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .info-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .info-tag, .skill-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .card-footer-strip {
      padding: 1rem 2rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-indicator {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot-pulse {
      width: 8px; height: 8px;
      border-radius: 50%;
    }
    .dot-pulse.green { background: #10b981; box-shadow: 0 0 10px #10b981; }
    .dot-pulse.blue { background: #3b82f6; box-shadow: 0 0 10px #3b82f6; }
    .dot-pulse.purple { background: #8b5cf6; box-shadow: 0 0 10px #8b5cf6; }

    .price-input-wrapper { position: relative; }
    .price-input-wrapper .currency { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .price-input-wrapper input { padding-left: 2rem; }

    .section-fade-in { animation: fadeInUp 0.5s ease-out; }
    .empty-state { padding: 5rem; text-align: center; color: var(--text-muted); font-size: 1.2rem; }

    @media (max-width: 900px) {
      .hero-title { font-size: 3rem; }
      .control-center { flex-direction: column; align-items: stretch; gap: 1.5rem; }
      .group-fixed { width: 100%; }
    }
  `]
})
export class FrontofficeComponent implements OnInit, OnDestroy {
  private formationService = inject(FormationService);
  private seanceService = inject(SeanceService);
  private jobOffreService = inject(JobOffreService);
  private certificationService = inject(CertificationService);
  private hackathonService = inject(HackathonService);

  activeSection: 'formations' | 'schedule' | 'jobs' | 'certs' | 'hackathons' = 'formations';

  /** Active formations from API (catalog source). */
  private formationsCatalog: Formation[] = [];
  formations: Formation[] = [];
  seances: Seance[] = [];
  jobOffres: JobOffre[] = [];
  certifications: Certification[] = [];
  hackathons: Hackathon[] = [];

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
    this.loadHackathons();
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

  loadHackathons() {
    this.hackathonService.getAll().subscribe({
      next: (data) => this.hackathons = data,
      error: (err) => console.error('Error loading hackathons:', err)
    });
  }
}
