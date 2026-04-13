import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';
import { SeancesManagementComponent } from './seances-management.component';
import { JobOffresManagementComponent } from './joboffres-management.component';
import { CertificationsManagementComponent } from './certifications-management.component';
import { UsersManagementComponent } from './users-management.component';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SeancesManagementComponent,
    JobOffresManagementComponent,
    CertificationsManagementComponent,
    UsersManagementComponent
  ],
  template: `
    <div class="admin-wrapper animate-fade-in">
      <div class="container py-5">
        <header class="admin-header d-flex justify-between align-center mb-5">
          <div>
            <h1 class="page-title">Management <span class="text-primary">Console</span></h1>
            <p class="text-muted">Orchestrate your formations, schedules, and job ecosystem.</p>
          </div>
          <button class="btn btn-primary btn-glow" (click)="openForm()" *ngIf="activeTab === 'formations'">
            + New Formation
          </button>
        </header>

        <!-- Modern Pills Navigation -->
        <div class="pills-nav glass-panel mb-5">
          <button 
            class="pill-btn" 
            [class.active]="activeTab === 'formations'"
            (click)="activeTab = 'formations'">
            📚 Formations
          </button>
          <button 
            class="pill-btn" 
            [class.active]="activeTab === 'seances'"
            (click)="activeTab = 'seances'">
            📅 Sessions
          </button>
          <button 
            class="pill-btn" 
            [class.active]="activeTab === 'joboffres'"
            (click)="activeTab = 'joboffres'">
            💼 Careers
          </button>
          <button 
            class="pill-btn" 
            [class.active]="activeTab === 'certifications'"
            (click)="activeTab = 'certifications'">
            🏅 Certs
          </button>
          <button 
            class="pill-btn" 
            [class.active]="activeTab === 'users'"
            (click)="activeTab = 'users'">
            👥 Users
          </button>
        </div>

        <!-- Formations Tab -->
        <div *ngIf="activeTab === 'formations'" class="section-fade-in">
          <div class="glass-panel control-bar mb-4">
            <div class="filter-field grow">
              <label>Search Title</label>
              <input type="text" class="form-control" [(ngModel)]="filterTitle" (ngModelChange)="scheduleFilter()" placeholder="Filter formations...">
            </div>
            <div class="filter-field">
              <label>Field</label>
              <select class="form-control" [(ngModel)]="filterCategory" (ngModelChange)="applyLocalFilters()">
                <option value="">All Fields</option>
                <option value="IT">IT & Tech</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Max Budget ($)</label>
              <input type="number" class="form-control" [(ngModel)]="filterMaxPrice" (ngModelChange)="scheduleFilter()" placeholder="0.00">
            </div>
            <div class="filter-actions d-flex gap-2">
              <button class="btn btn-outline btn-sm" (click)="loadAll()">Sync Registry</button>
            </div>
          </div>

          <div class="table-card glass-panel overflow-hidden">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Category</th>
                  <th>Investment</th>
                  <th>Status</th>
                  <th class="text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let form of formations">
                  <td>
                    <div class="d-flex flex-col">
                      <span class="font-bold">{{form.titre}}</span>
                      <span class="text-xs text-muted">ID: #{{form.id}}</span>
                    </div>
                  </td>
                  <td><span class="badge-tag">{{form.categorie}}</span></td>
                  <td><span class="text-success font-bold">\${{form.prix}}</span></td>
                  <td>
                    <span class="status-indicator" [class.active]="form.active">
                      {{form.active ? 'Operational' : 'Paused'}}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2 justify-end">
                      <button class="action-btn" (click)="editFormation(form)" title="Edit">✏️</button>
                      <button class="action-btn" (click)="toggleActive(form)" title="Toggle Status">🔄</button>
                      <button class="action-btn danger" (click)="deleteFormation(form.id!)" title="Archive">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="formations.length === 0">
                  <td colspan="5" class="empty-row text-center text-muted">No tactical formations found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <app-seances-management *ngIf="activeTab === 'seances'"></app-seances-management>
        <app-joboffres-management *ngIf="activeTab === 'joboffres'"></app-joboffres-management>
        <app-certifications-management *ngIf="activeTab === 'certifications'"></app-certifications-management>
        <app-users-management *ngIf="activeTab === 'users'"></app-users-management>
      </div>

      <!-- Modal Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-pane animate-fade-in">
          <header class="modal-header">
            <h3>{{ editing ? 'Refine' : 'Initialize' }} Formation</h3>
            <button class="close-modal" (click)="closeForm()">&times;</button>
          </header>
          <form (ngSubmit)="saveFormation()" class="modal-body">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Formation Title</label>
                <input type="text" class="form-control" name="titre" [(ngModel)]="currentFormation.titre" required>
              </div>
              <div class="form-group span-2">
                <label>Detailed Strategy (Description)</label>
                <textarea class="form-control" name="desc" [(ngModel)]="currentFormation.description" rows="4" required></textarea>
              </div>
              <div class="form-group">
                <label>Vertical</label>
                <select class="form-control" name="cat" [(ngModel)]="currentFormation.categorie" required>
                  <option value="IT">IT & Tech</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div class="form-group">
                <label>Price Point ($)</label>
                <input type="number" class="form-control" name="prix" [(ngModel)]="currentFormation.prix" required>
              </div>
              <div class="form-group span-2 checkbox-group">
                <label class="switch">
                  <input type="checkbox" name="active" [(ngModel)]="currentFormation.active">
                  <span class="slider round"></span>
                </label>
                <span>Activate this formation immediately</span>
              </div>
            </div>
            <footer class="modal-footer d-flex gap-3 mt-5">
              <button type="submit" class="btn btn-primary btn-grow">Confirm Strategy</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Cancel</button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      background: radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.05), transparent 40%);
      min-height: calc(100vh - 80px);
    }
    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .py-5 { padding-top: 3rem; padding-bottom: 3rem; }

    /* Pills Navigation */
    .pills-nav {
      display: inline-flex;
      padding: 0.5rem;
      border-radius: 100px;
      gap: 0.5rem;
    }
    .pill-btn {
      background: transparent;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 100px;
      color: var(--text-muted);
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }
    .pill-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
    .pill-btn.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    /* Control Bar */
    .control-bar {
      padding: 1.5rem;
      display: flex;
      gap: 2rem;
      align-items: flex-end;
    }
    .filter-field label {
      display: block;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .grow { flex: 1; }

    /* Premium Table */
    .table-card { border-radius: 20px; }
    .premium-table {
      width: 100%;
      border-collapse: collapse;
    }
    .premium-table th {
      background: rgba(255,255,255,0.02);
      padding: 1.25rem 1.5rem;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      text-align: left;
    }
    .premium-table td {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .premium-table tr:hover td {
      background: rgba(255,255,255,0.01);
    }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.75rem; }
    .badge-tag {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .status-indicator::before {
      content: '';
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .status-indicator.active { color: var(--success); }
    .status-indicator.active::before { background: var(--success); box-shadow: 0 0 8px var(--success); }

    /* Action Buttons */
    .action-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition);
    }
    .action-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.1); }
    .action-btn.danger:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: rgba(239, 68, 68, 0.2); }

    /* Modal Styling */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.8);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .modal-pane {
      width: 100%;
      max-width: 600px;
      padding: 2.5rem;
      border-radius: 24px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .close-modal {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .span-2 { grid-column: span 2; }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Toggle Switch */
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #334155; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }

    .btn-grow { flex: 1; }
    .text-right { text-align: right; }
    .justify-end { justify-content: flex-end; }
  `]
})
export class BackofficeComponent implements OnInit, OnDestroy {
  private formationService = inject(FormationService);

  activeTab: 'formations' | 'seances' | 'joboffres' | 'certifications' | 'users' = 'formations';
  /** Source list from the API (full list or active page). */
  allFormations: Formation[] = [];
  /** Rows shown after local filters. */
  formations: Formation[] = [];

  filterTitle = '';
  filterCategory = '';
  filterMaxPrice: number | null = null;

  private readonly filterBus = new Subject<void>();
  private filterSub: Subscription;

  showForm = false;
  editing = false;
  currentFormation: Formation = this.getEmptyForm();

  constructor() {
    this.filterSub = this.filterBus.pipe(debounceTime(300)).subscribe(() => this.applyLocalFilters());
  }

  ngOnInit() {
    this.loadAll();
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

  /** Debounced path for title / max price typing. */
  scheduleFilter() {
    this.filterBus.next();
  }

  loadAll() {
    this.filterTitle = '';
    this.filterCategory = '';
    this.filterMaxPrice = null;
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.allFormations = data ?? [];
        this.applyLocalFilters();
      },
      error: (err) => console.error(err)
    });
  }

  /**
   * Client-side filter so title + category + max price combine correctly and react without Enter.
   */
  applyLocalFilters() {
    const q = (this.filterTitle ?? '').trim().toLowerCase();
    const cat = (this.filterCategory ?? '').trim();
    const rawMax = this.filterMaxPrice;
    const maxP =
      rawMax === null || rawMax === undefined || (typeof rawMax === 'number' && Number.isNaN(rawMax))
        ? null
        : rawMax;

    this.formations = this.allFormations.filter((f) => {
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

  loadActivePage() {
    this.filterTitle = '';
    this.filterCategory = '';
    this.filterMaxPrice = null;
    this.formationService.getActive(0, 50).subscribe({
      next: (page) => {
        this.allFormations = page.content ?? [];
        this.applyLocalFilters();
      },
      error: (err) => console.error(err)
    });
  }

  getEmptyForm(): Formation {
    return { titre: '', description: '', categorie: 'IT', prix: 0, active: true };
  }

  openForm() {
    this.editing = false;
    this.currentFormation = this.getEmptyForm();
    this.showForm = true;
  }

  editFormation(formation: Formation) {
    this.editing = true;
    this.currentFormation = { ...formation };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveFormation() {
    if (this.currentFormation.titre && this.currentFormation.description) {
      if (this.editing && this.currentFormation.id) {
        this.formationService.update(this.currentFormation.id, this.currentFormation).subscribe({
          next: () => {
            this.loadAll();
            this.closeForm();
          },
          error: (err) => console.error(err)
        });
      } else {
        this.formationService.create(this.currentFormation).subscribe({
          next: () => {
            this.loadAll();
            this.closeForm();
          },
          error: (err) => console.error(err)
        });
      }
    }
  }

  deleteFormation(id: number) {
    if (confirm("Are you sure you want to delete this formation?")) {
      this.formationService.delete(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    }
  }

  toggleActive(form: Formation) {
    if (form.id == null) {
      return;
    }
    if (form.active === true) {
      this.formationService.deactivate(form.id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    } else {
      this.formationService.activate(form.id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    }
  }
}
