import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOffreService } from '../../core/services/joboffre.service';
import { JobOffre } from '../../core/models/joboffre.model';

@Component({
  selector: 'app-joboffres-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel animate-fade-in">
      <div class="header-status mb-4 d-flex justify-between align-center">
        <div>
          <h2 class="section-title">Career <span class="text-primary">Opportunities</span></h2>
          <p class="text-muted text-sm">Design and publish strategic job offers for the ecosystem.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-glow" (click)="openForm()">+ New Position</button>
        </div>
      </div>

      <div class="glass-panel search-bar mb-4 p-3">
        <div class="input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="form-control" placeholder="Identify position by name..." [(ngModel)]="searchQuery" (input)="onSearch()">
        </div>
      </div>

      <div class="table-card glass-panel overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Type</th>
              <th>Compensation</th>
              <th>Timestamp</th>
              <th class="text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let offre of jobOffres">
              <td>
                <div class="d-flex flex-col">
                  <span class="font-bold">{{offre.nameJoboffer}}</span>
                  <span class="text-xs text-muted">ID: #{{offre.idJoboffer}}</span>
                </div>
              </td>
              <td><span class="contract-tag" [class]="offre.contratTypeoffer.toLowerCase()">{{offre.contratTypeoffer}}</span></td>
              <td><span class="text-success font-bold">{{offre.offerSalary}}</span></td>
              <td><span class="text-muted text-sm">{{offre.offerDate | date:'mediumDate'}}</span></td>
              <td>
                <div class="d-flex gap-2 justify-end">
                  <button class="action-btn" (click)="editJobOffre(offre)" title="Refine">✏️</button>
                  <button class="action-btn danger" (click)="deleteJobOffre(offre.idJoboffer!)" title="Archive">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="jobOffres.length === 0">
              <td colspan="5" class="empty-row text-center text-muted">No vacancies identified yet.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Form Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-pane animate-fade-in">
          <header class="modal-header">
            <h3>{{ editing ? 'Refine' : 'Blueprint' }} Job Offer</h3>
            <button class="close-modal" (click)="closeForm()">&times;</button>
          </header>
          <form (ngSubmit)="saveJobOffre()" class="modal-body">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Position Name</label>
                <input type="text" class="form-control" name="nameJoboffer" [(ngModel)]="currentJobOffre.nameJoboffer" required>
              </div>
              <div class="form-group span-2">
                <label>Mission Description</label>
                <textarea class="form-control" name="descriptionOffer" [(ngModel)]="currentJobOffre.descriptionOffer" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label>Engagement Type</label>
                <select class="form-control" name="contratTypeoffer" [(ngModel)]="currentJobOffre.contratTypeoffer" required>
                  <option value="CDI">CDI - Permanent</option>
                  <option value="CDD">CDD - Fixed Term</option>
                  <option value="Stage">Internship</option>
                  <option value="Freelance">Independent</option>
                </select>
              </div>
              <div class="form-group">
                <label>Compensation Package</label>
                <input type="text" class="form-control" name="offerSalary" [(ngModel)]="currentJobOffre.offerSalary" required>
              </div>
              <div class="form-group span-2">
                <label>Release Date</label>
                <input type="date" class="form-control" name="offerDate" [(ngModel)]="currentJobOffre.offerDate" required>
              </div>
              <div class="form-group span-2">
                <label>Core Prerequisites (Skills)</label>
                <textarea class="form-control" name="skillsOffer" [(ngModel)]="currentJobOffre.skillsOffer" rows="2" placeholder="Java, Angular, etc." required></textarea>
              </div>
            </div>
            <footer class="modal-footer d-flex gap-3 mt-5">
              <button type="submit" class="btn btn-primary btn-grow">Publish Position</button>
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
    
    .input-wrapper { position: relative; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5; }
    .input-wrapper .form-control { padding-left: 2.8rem; background: rgba(0,0,0,0.2); }

    /* Modern Table */
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
    
    .contract-tag { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.05); text-transform: uppercase; }
    .contract-tag.cdi { color: var(--success); background: rgba(16, 185, 129, 0.1); }
    .contract-tag.cdd { color: var(--primary); background: rgba(99, 102, 241, 0.1); }
    .contract-tag.stage { color: var(--accent); background: rgba(217, 70, 239, 0.1); }
    .contract-tag.freelance { color: var(--warning); background: rgba(245, 158, 11, 0.1); }

    /* Actions */
    .action-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 0.4rem; border-radius: 8px; cursor: pointer; transition: var(--transition); }
    .action-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .action-btn.danger:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-pane { width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .span-2 { grid-column: span 2; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .close-modal { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
    
    .btn-grow { flex: 1; }
    .font-bold { font-weight: 700; }
    .text-right { text-align: right; }
    .justify-end { justify-content: flex-end; }
  `]
})
export class JobOffresManagementComponent implements OnInit {
  private jobOffreService = inject(JobOffreService);

  jobOffres: JobOffre[] = [];
  searchQuery: string = '';

  showForm = false;
  editing = false;
  currentJobOffre: JobOffre = this.getEmptyForm();

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.jobOffreService.getAll().subscribe({
      next: (data) => this.jobOffres = data,
      error: (err) => console.error(err)
    });
  }

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.loadAll();
    } else {
      this.jobOffreService.searchByName(this.searchQuery).subscribe({
        next: (data) => this.jobOffres = data,
        error: (err) => console.error(err)
      });
    }
  }

  getEmptyForm(): JobOffre {
    return { 
      nameJoboffer: '', 
      descriptionOffer: '', 
      contratTypeoffer: 'CDI', 
      offerSalary: '', 
      offerDate: '', 
      skillsOffer: '' 
    };
  }

  openForm() {
    this.editing = false;
    this.currentJobOffre = this.getEmptyForm();
    this.showForm = true;
  }

  editJobOffre(offre: JobOffre) {
    this.editing = true;
    this.currentJobOffre = { ...offre };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveJobOffre() {
    if (this.editing && this.currentJobOffre.idJoboffer) {
      this.jobOffreService.update(this.currentJobOffre.idJoboffer, this.currentJobOffre).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.jobOffreService.create(this.currentJobOffre).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteJobOffre(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre?")) {
      this.jobOffreService.delete(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    }
  }
}
