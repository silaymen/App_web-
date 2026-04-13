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
    <div class="admin-panel animate-fade-in">
      <div class="header-status mb-4 d-flex justify-between align-center">
        <div>
          <h2 class="section-title">Certification <span class="text-primary">Authority</span></h2>
          <p class="text-muted text-sm">Issue and manage official credentials via Gateway: <strong>{{ apiGatewayUrl }}</strong></p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary btn-glow" (click)="openForm()">+ Issue Certificate</button>
        </div>
      </div>

      <div class="glass-panel search-bar mb-4 p-3">
        <div class="filter-toolbar">
          <div class="input-wrapper grow">
            <span class="search-icon">🔍</span>
            <input
              id="cert-search"
              type="text"
              class="form-control"
              [(ngModel)]="searchTerm"
              (ngModelChange)="scheduleSearch()"
              placeholder="Locate certificate by name..."
              autocomplete="off">
          </div>
          <button type="button" class="btn btn-outline btn-sm" (click)="resetSearch()">Sync Cache</button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card glass-panel overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th class="sortable" (click)="onSort('id')">ID</th>
              <th class="sortable" (click)="onSort('name')">Certificate</th>
              <th>Version</th>
              <th class="sortable" (click)="onSort('issueDate')">Valid From</th>
              <th class="sortable" (click)="onSort('expiryDate')">Valid Until</th>
              <th>Owner</th>
              <th class="text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cert of certifications">
              <td class="text-muted text-xs">#{{ cert.id }}</td>
              <td><span class="font-bold">{{ cert.name }}</span></td>
              <td><span class="cert-pill">{{ cert.version || 'v1.0' }}</span></td>
              <td><span class="text-sm">{{ cert.issueDate | date:'mediumDate' }}</span></td>
              <td><span class="text-sm" [class.text-danger]="isExpired(cert)">{{ cert.expiryDate | date:'mediumDate' }}</span></td>
              <td><span class="text-xs text-muted">{{ cert.ownerEmail || 'system@ezlearning.io' }}</span></td>
              <td>
                <div class="d-flex gap-2 justify-end">
                  <button type="button" class="action-btn" (click)="editCertification(cert)" title="Refine">✏️</button>
                  <button type="button" class="action-btn danger" (click)="deleteCertification(cert.id!)" title="Revoke">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!loading && certifications.length === 0">
              <td colspan="7" class="empty-row text-center text-muted">No official certifications issued yet.</td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="7" class="empty-row text-center text-primary">Synchronizing with Authority...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-pane animate-fade-in">
          <header class="modal-header">
            <h3>{{ editing ? 'Refine' : 'Blueprint' }} Certification</h3>
            <button class="close-modal" (click)="closeForm()">&times;</button>
          </header>
          <form (ngSubmit)="saveCertification()" class="modal-body">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Certificate Name</label>
                <input type="text" class="form-control" name="name" [(ngModel)]="currentCert.name" required>
              </div>
              <div class="form-group span-2">
                <label>Outcome Description</label>
                <textarea class="form-control" name="description" rows="3" [(ngModel)]="currentCert.description"></textarea>
              </div>
              <div class="form-group">
                <label>Iteration (Version)</label>
                <input type="text" class="form-control" name="version" [(ngModel)]="currentCert.version" placeholder="1.0.0">
              </div>
              <div class="form-group">
                <label>Validity Horizon (Days)</label>
                <input type="number" class="form-control" name="validityDays" [(ngModel)]="currentCert.validityDays" min="1">
              </div>
              <div class="form-group">
                <label>Issuance Timestamp</label>
                <input type="date" class="form-control" name="issueDate" [(ngModel)]="currentCert.issueDate">
              </div>
              <div class="form-group">
                <label>Termination Timestamp</label>
                <input type="date" class="form-control" name="expiryDate" [(ngModel)]="currentCert.expiryDate">
              </div>
              <div class="form-group span-2">
                <label>Recipient Master Email</label>
                <input type="email" class="form-control" name="ownerEmail" [(ngModel)]="currentCert.ownerEmail" placeholder="user@domain.com">
              </div>
            </div>
            <footer class="modal-footer d-flex gap-3 mt-5">
              <button type="submit" class="btn btn-primary btn-grow" [disabled]="!(currentCert.name && currentCert.name.trim())">Authorize Registry</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Cancel</button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
    .text-sm { font-size: 0.85rem; }
    .text-xs { font-size: 0.75rem; }
    .font-bold { font-weight: 700; }
    
    .filter-toolbar { display: flex; gap: 1rem; align-items: center; }
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 1rem; opacity: 0.5; }
    .input-wrapper .form-control { padding-left: 2.8rem; background: rgba(0,0,0,0.2); flex: 1; }

    /* Modern Table */
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
    .premium-table th.sortable { cursor: pointer; transition: 0.2s; }
    .premium-table th.sortable:hover { color: var(--primary); }

    .cert-pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 20px; background: rgba(217, 70, 239, 0.1); color: var(--accent); font-weight: 700; border: 1px solid rgba(217, 70, 239, 0.2); }

    /* Actions */
    .action-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 0.4rem; border-radius: 8px; cursor: pointer; transition: var(--transition); }
    .action-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .action-btn.danger:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-pane { width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 24px; max-height: 90vh; overflow-y: auto; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .span-2 { grid-column: span 2; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .close-modal { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

    .btn-grow { flex: 1; }
    .justify-end { justify-content: flex-end; }
    .text-right { text-align: right; }
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

  isExpired(cert: Certification): boolean {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  }
}
