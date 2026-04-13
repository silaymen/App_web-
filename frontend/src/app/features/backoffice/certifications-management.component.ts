import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { CertificationService } from '../../core/services/certification.service';
import { Certification } from '../../core/models/certification.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certifications-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container admin-container">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h2>Gestion des Certifications</h2>
          <p class="text-muted">Créer et gérer les certifications via la passerelle <strong>{{ apiGatewayUrl }}</strong>.</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openForm()">+ Nouvelle certification</button>
      </div>

      <div class="glass-panel mb-4 filter-panel">
        <div class="filter-toolbar">
          <div class="filter-field filter-field-grow">
            <label class="form-label" for="cert-search">Recherche par nom</label>
            <input
              id="cert-search"
              type="text"
              class="form-control"
              [(ngModel)]="searchTerm"
              (ngModelChange)="scheduleSearch()"
              placeholder="Tapez pour filtrer…"
              autocomplete="off">
          </div>
          <div class="filter-field">
            <label class="form-label">&nbsp;</label>
            <button type="button" class="btn btn-outline" (click)="resetSearch()">Réinitialiser</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-content">
          <h3 class="mb-3">{{ editing ? 'Modifier' : 'Créer' }} une certification</h3>
          <form (ngSubmit)="saveCertification()">
            <div class="form-group">
              <label class="form-label">Nom <span class="text-danger">*</span></label>
              <input type="text" class="form-control" name="name" [(ngModel)]="currentCert.name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description" rows="3" [(ngModel)]="currentCert.description"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Version</label>
                <input type="text" class="form-control" name="version" [(ngModel)]="currentCert.version">
              </div>
              <div class="form-group">
                <label class="form-label">Validité (jours)</label>
                <input type="number" class="form-control" name="validityDays" [(ngModel)]="currentCert.validityDays" min="1">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date d'émission</label>
                <input type="date" class="form-control" name="issueDate" [(ngModel)]="currentCert.issueDate">
              </div>
              <div class="form-group">
                <label class="form-label">Date d'expiration</label>
                <input type="date" class="form-control" name="expiryDate" [(ngModel)]="currentCert.expiryDate">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email propriétaire</label>
              <input type="email" class="form-control" name="ownerEmail" [(ngModel)]="currentCert.ownerEmail">
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary" [disabled]="!(currentCert.name && currentCert.name.trim())">Enregistrer</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Annuler</button>
            </div>
          </form>
        </div>
      </div>

      <div class="glass-panel table-container">
        <table class="admin-table w-100">
          <thead>
            <tr>
              <th class="sortable" (click)="onSort('id')">ID <span *ngIf="sortBy === 'id'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="sortable" (click)="onSort('name')">Nom <span *ngIf="sortBy === 'name'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="sortable" (click)="onSort('version')">Version <span *ngIf="sortBy === 'version'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="sortable" (click)="onSort('issueDate')">Émission <span *ngIf="sortBy === 'issueDate'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="sortable" (click)="onSort('expiryDate')">Expiration <span *ngIf="sortBy === 'expiryDate'">{{ sortDir === 'asc' ? '↑' : '↓' }}</span></th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cert of certifications">
              <td class="text-muted">#{{ cert.id }}</td>
              <td style="font-weight:600">{{ cert.name }}</td>
              <td><span class="version-pill">{{ cert.version || '—' }}</span></td>
              <td>{{ cert.issueDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ cert.expiryDate | date:'dd/MM/yyyy' }}</td>
              <td class="text-muted desc-cell">{{ cert.ownerEmail || '—' }}</td>
              <td>
                <div class="d-flex gap-2 actions-col">
                  <button type="button" class="btn-icon" title="Modifier" (click)="editCertification(cert)">✏️</button>
                  <button type="button" class="btn-icon danger" title="Supprimer" (click)="deleteCertification(cert.id!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!loading && certifications.length === 0">
              <td colspan="7" class="text-center text-muted p-4">Aucune certification.</td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="7" class="text-center text-muted p-4">Chargement…</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { max-width: 1200px; }
    .w-100 { width: 100%; }
    .filter-panel { padding: 1.25rem 1.5rem; }
    .filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 1.25rem;
      align-items: flex-end;
    }
    .filter-field-grow { flex: 1; min-width: 200px; }
    .table-container { overflow-x: auto; }
    .admin-table {
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .admin-table th, .admin-table td {
      padding: 1rem 0.8rem;
      border-bottom: 1px solid var(--glass-border);
    }
    .admin-table th {
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
    }
    .admin-table th.sortable {
      cursor: pointer;
      user-select: none;
    }
    .admin-table th.sortable:hover { color: var(--text-main); }
    .admin-table tbody tr { transition: var(--transition); }
    .admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .version-pill {
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
      border-radius: 20px;
      background: rgba(59, 130, 246, 0.15);
      color: var(--primary);
      font-weight: 600;
    }
    .desc-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
    .btn-icon:hover { background: rgba(255,255,255,0.1); opacity: 1; }
    .btn-icon.danger:hover { background: rgba(239, 68, 68, 0.2); }
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
      max-width: 560px;
      padding: 2rem;
      max-height: 90vh;
      overflow-y: auto;
    }
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-group { flex: 1; min-width: 0; }
  `]
})
export class CertificationsManagementComponent implements OnInit, OnDestroy {
  private readonly certService = inject(CertificationService);
  private readonly searchBus = new Subject<void>();
  private searchSub?: Subscription;

  readonly apiGatewayUrl = environment.apiGatewayUrl;

  certifications: Certification[] = [];
  loading = false;
  searchTerm = '';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  showForm = false;
  editing = false;
  currentCert: Certification = this.getEmptyCert();

  ngOnInit(): void {
    this.searchSub = this.searchBus.pipe(debounceTime(300)).subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  scheduleSearch(): void {
    this.searchBus.next();
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.load();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.load();
  }

  getEmptyCert(): Certification {
    return {
      name: '',
      description: '',
      version: '',
      validityDays: 365,
      issueDate: '',
      expiryDate: '',
      ownerEmail: ''
    };
  }

  load(): void {
    this.loading = true;
    this.certService.getCertifications(this.searchTerm.trim(), this.sortBy, this.sortDir).subscribe({
      next: (data) => {
        this.certifications = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.certifications = [];
        this.loading = false;
      }
    });
  }

  openForm(): void {
    this.editing = false;
    this.currentCert = this.getEmptyCert();
    this.showForm = true;
  }

  editCertification(cert: Certification): void {
    this.editing = true;
    this.currentCert = { ...cert };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveCertification(): void {
    if (!this.currentCert.name?.trim()) {
      return;
    }
    if (this.editing && this.currentCert.id != null) {
      this.certService.updateCertification(this.currentCert.id, this.currentCert).subscribe({
        next: () => {
          this.load();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.certService.addCertification(this.currentCert).subscribe({
        next: () => {
          this.load();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteCertification(id: number): void {
    if (confirm('Supprimer cette certification ?')) {
      this.certService.deleteCertification(id).subscribe({
        next: () => this.load(),
        error: (err) => console.error(err)
      });
    }
  }
}
