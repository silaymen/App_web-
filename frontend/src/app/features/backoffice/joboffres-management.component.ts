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
    <div class="container admin-container">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h2>Gestion des Offres d'Emploi</h2>
          <p class="text-muted">Gérer toutes les offres d'emploi depuis ce panneau.</p>
        </div>
        <div class="d-flex gap-3 align-center">
          <div class="search-box">
            <input type="text" class="form-control" placeholder="Rechercher une offre..." [(ngModel)]="searchQuery" (input)="onSearch()">
          </div>
          <button class="btn btn-primary" (click)="openForm()">+ Nouvelle Offre</button>
        </div>
      </div>

      <!-- Add/Edit Form Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-content">
          <h3 class="mb-3">{{ editing ? 'Modifier' : 'Créer' }} Offre d'Emploi</h3>
          <form (ngSubmit)="saveJobOffre()">
            <div class="form-group">
              <label class="form-label">Titre du Poste</label>
              <input type="text" class="form-control" name="nameJoboffer" [(ngModel)]="currentJobOffre.nameJoboffer" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="descriptionOffer" [(ngModel)]="currentJobOffre.descriptionOffer" rows="3" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type de Contrat</label>
                <select class="form-control" name="contratTypeoffer" [(ngModel)]="currentJobOffre.contratTypeoffer" required>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Salaire</label>
                <input type="text" class="form-control" name="offerSalary" [(ngModel)]="currentJobOffre.offerSalary" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Date de Publication</label>
              <input type="date" class="form-control" name="offerDate" [(ngModel)]="currentJobOffre.offerDate" required>
            </div>
            <div class="form-group">
              <label class="form-label">Compétences Requises</label>
              <textarea class="form-control" name="skillsOffer" [(ngModel)]="currentJobOffre.skillsOffer" rows="2" required></textarea>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Enregistrer</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Annuler</button>
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
              <th>Titre</th>
              <th>Type Contrat</th>
              <th>Salaire</th>
              <th>Date</th>
              <th>Compétences</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let offre of jobOffres">
              <td class="text-muted">#{{offre.idJoboffer}}</td>
              <td style="font-weight:600">{{offre.nameJoboffer}}</td>
              <td>
                <span class="type-badge" [class]="'type-' + offre.contratTypeoffer.toLowerCase()">
                  {{offre.contratTypeoffer}}
                </span>
              </td>
              <td>{{offre.offerSalary}}</td>
              <td>{{offre.offerDate | date:'dd/MM/yyyy'}}</td>
              <td class="skills-cell">{{offre.skillsOffer}}</td>
              <td>
                <div class="d-flex gap-2 actions-col">
                  <button class="btn-icon" title="Modifier" (click)="editJobOffre(offre)">✏️</button>
                  <button class="btn-icon danger" title="Supprimer" (click)="deleteJobOffre(offre.idJoboffer!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="jobOffres.length === 0">
              <td colspan="7" class="text-center text-muted p-4">Aucune offre d'emploi disponible.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
    }
    .w-100 { width: 100%; }
    .table-container {
      overflow-x: auto;
    }
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
    .admin-table tbody tr {
      transition: var(--transition);
    }
    .admin-table tbody tr:hover {
      background: rgba(255,255,255,0.02);
    }
    .type-badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 600;
    }
    .type-badge.type-cdi { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .type-badge.type-cdd { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .type-badge.type-stage { background: rgba(168, 85, 247, 0.2); color: #a78bfa; }
    .type-badge.type-freelance { background: rgba(251, 146, 60, 0.2); color: #fb923c; }
    
    .skills-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
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
      max-width: 600px;
      padding: 2rem;
      max-height: 90vh;
      overflow-y: auto;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-row .form-group {
      flex: 1;
    }
    .search-box input {
      min-width: 250px;
      padding: 0.6rem 1rem;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.2);
      color: white;
      transition: var(--transition);
    }
    .search-box input:focus {
      outline: none;
      border-color: var(--primary);
    }
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
