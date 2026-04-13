import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { FormationService } from '../../core/services/formation.service';
import { Formation } from '../../core/models/formation.model';
import { SeancesManagementComponent } from './seances-management.component';
import { JobOffresManagementComponent } from './joboffres-management.component';
import { CertificationsManagementComponent } from './certifications-management.component';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SeancesManagementComponent,
    JobOffresManagementComponent,
    CertificationsManagementComponent
  ],
  template: `
    <div class="container admin-container">
      <!-- Navigation Tabs -->
      <div class="tabs-container mb-4">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'formations'"
          (click)="activeTab = 'formations'">
          📚 Formations
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'seances'"
          (click)="activeTab = 'seances'">
          📅 Emploi du Temps
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'joboffres'"
          (click)="activeTab = 'joboffres'">
          💼 Offres d'Emploi
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'certifications'"
          (click)="activeTab = 'certifications'">
          🏅 Certifications
        </button>
      </div>

      <!-- Formations Tab -->
      <div *ngIf="activeTab === 'formations'">
        <div class="d-flex justify-between align-center mb-4">
          <div>
            <h2>Admin Dashboard</h2>
            <p class="text-muted">Manage all formations from this panel.</p>
          </div>
          <button class="btn btn-primary" (click)="openForm()">+ New Formation</button>
        </div>

        <div class="glass-panel mb-4 formation-filters">
          <div class="filter-toolbar">
            <div class="filter-field filter-field-grow">
              <label class="form-label" for="bo-filter-title">Search by title</label>
              <input id="bo-filter-title" type="text" class="form-control" [(ngModel)]="filterTitle"
                (ngModelChange)="scheduleFilter()" placeholder="Type to filter…" autocomplete="off">
            </div>
            <div class="filter-field">
              <label class="form-label" for="bo-filter-cat">Category</label>
              <select id="bo-filter-cat" class="form-control" [(ngModel)]="filterCategory" (ngModelChange)="applyLocalFilters()">
                <option value="">All</option>
                <option value="IT">IT & Tech</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div class="filter-field">
              <label class="form-label" for="bo-filter-price">Max price</label>
              <input id="bo-filter-price" type="number" min="0" step="0.01" class="form-control"
                [(ngModel)]="filterMaxPrice" (ngModelChange)="scheduleFilter()" placeholder="No limit">
            </div>
            <div class="filter-actions">
              <button type="button" class="btn btn-outline" (click)="loadAll()">Reset filters</button>
              <button type="button" class="btn btn-sm btn-outline" (click)="loadActivePage()">Active only (paginated)</button>
            </div>
          </div>
          <p class="filter-help text-muted">Title and max price update the table automatically after a short pause. Category updates immediately.</p>
        </div>

      <!-- Add/Edit Form Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-content">
          <h3 class="mb-3">{{ editing ? 'Edit' : 'Create' }} Formation</h3>
          <form (ngSubmit)="saveFormation()">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-control" name="titre" [(ngModel)]="currentFormation.titre" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="desc" [(ngModel)]="currentFormation.description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" name="cat" [(ngModel)]="currentFormation.categorie" required>
                <option value="IT">IT & Tech</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price</label>
              <input type="number" class="form-control" name="prix" [(ngModel)]="currentFormation.prix" required>
            </div>
            <div class="form-group" style="flex-direction:row; align-items:center; gap:0.5rem">
              <input type="checkbox" name="active" [(ngModel)]="currentFormation.active" id="activeCheck">
              <label for="activeCheck" class="form-label" style="margin:0">Active</label>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-panel table-container">
        <table class="admin-table w-100">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let form of formations">
              <td class="text-muted">#{{form.id}}</td>
              <td style="font-weight:600">{{form.titre}}</td>
              <td>{{form.categorie}}</td>
              <td>\${{form.prix}}</td>
              <td>
                <span class="status-badge" [class.active]="form.active" [class.inactive]="!form.active">
                  {{form.active ? 'Active' : 'Inactive'}}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2 actions-col">
                  <button class="btn-icon" title="Edit" (click)="editFormation(form)">✏️</button>
                  <button class="btn-icon" [title]="form.active ? 'Set inactive' : 'Set active'" (click)="toggleActive(form)">🔄</button>
                  <button class="btn-icon danger" title="Delete" (click)="deleteFormation(form.id!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="formations.length === 0">
              <td colspan="6" class="text-center text-muted p-4">No formations available.</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <!-- Seances Tab -->
      <app-seances-management *ngIf="activeTab === 'seances'"></app-seances-management>

      <!-- Job Offres Tab -->
      <app-joboffres-management *ngIf="activeTab === 'joboffres'"></app-joboffres-management>

      <!-- Certifications (Web.rar / ami) -->
      <app-certifications-management *ngIf="activeTab === 'certifications'"></app-certifications-management>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
    }
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
    .w-100 { width: 100%; }
    .table-container {
      overflow-x: auto;
    }
    .admin-table {
      border-collapse: collapse;
      text-align: left;
    }
    .admin-table th, .admin-table td {
      padding: 1.2rem 1rem;
      border-bottom: 1px solid var(--glass-border);
    }
    .admin-table th {
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }
    .admin-table tbody tr {
      transition: var(--transition);
    }
    .admin-table tbody tr:hover {
      background: rgba(255,255,255,0.02);
    }
    .status-badge {
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 600;
    }
    .status-badge.active { background: rgba(34, 197, 94, 0.2); color: var(--success); }
    .status-badge.inactive { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
    
    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.4rem;
      border-radius: 6px;
      transition: var(--transition);
      opacity: 0.8;
    }
    .btn-icon:hover {
      background: rgba(255,255,255,0.1);
      opacity: 1;
    }
    .btn-icon.danger:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .modal-overlay {
      position: fixed;
      top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      width: 100%;
      max-width: 500px;
      padding: 2rem;
    }
    .formation-filters {
      padding: 1.25rem 1.5rem;
    }
    .filter-toolbar {
      display: grid;
      grid-template-columns: minmax(200px, 1fr) minmax(160px, 200px) minmax(120px, 150px) minmax(160px, 220px);
      gap: 1rem 1.25rem;
      align-items: end;
    }
    .filter-field-grow { min-width: 0; }
    .filter-field .form-label {
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.85rem;
    }
    .filter-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-help {
      margin: 0.85rem 0 0;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    @media (max-width: 900px) {
      .filter-toolbar {
        grid-template-columns: 1fr 1fr;
      }
      .filter-actions {
        grid-column: 1 / -1;
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
    @media (max-width: 520px) {
      .filter-toolbar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BackofficeComponent implements OnInit, OnDestroy {
  private formationService = inject(FormationService);

  activeTab: 'formations' | 'seances' | 'joboffres' | 'certifications' = 'formations';
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
