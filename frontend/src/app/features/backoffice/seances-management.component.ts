import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeanceService } from '../../core/services/seance.service';
import { Seance } from '../../core/models/seance.model';

@Component({
  selector: 'app-seances-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container admin-container">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h2>Gestion Emploi du Temps</h2>
          <p class="text-muted">Gérer toutes les séances depuis ce panneau.</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ Nouvelle Séance</button>
      </div>

      <!-- Add/Edit Form Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-content">
          <h3 class="mb-3">{{ editing ? 'Modifier' : 'Créer' }} Séance</h3>
          <form (ngSubmit)="saveSeance()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="date" [(ngModel)]="currentSeance.date" required>
              </div>
              <div class="form-group">
                <label class="form-label">Heure Début</label>
                <input type="time" class="form-control" name="heureDebut" [(ngModel)]="currentSeance.heureDebut" required>
              </div>
              <div class="form-group">
                <label class="form-label">Heure Fin</label>
                <input type="time" class="form-control" name="heureFin" [(ngModel)]="currentSeance.heureFin" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Enseignant</label>
              <input type="text" class="form-control" name="enseignant" [(ngModel)]="currentSeance.enseignant" required>
            </div>
            <div class="form-group">
              <label class="form-label">Matière</label>
              <input type="text" class="form-control" name="matiere" [(ngModel)]="currentSeance.matiere" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Classe</label>
                <input type="text" class="form-control" name="classe" [(ngModel)]="currentSeance.classe" required>
              </div>
              <div class="form-group">
                <label class="form-label">Salle</label>
                <input type="text" class="form-control" name="salle" [(ngModel)]="currentSeance.salle" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Type de Séance</label>
              <select class="form-control" name="typeSeance" [(ngModel)]="currentSeance.typeSeance" required>
                <option value="Cours">Cours</option>
                <option value="TD">TD</option>
                <option value="TP">TP</option>
                <option value="Examen">Examen</option>
              </select>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Enregistrer</button>
              <button type="button" class="btn btn-outline" (click)="closeForm()">Annuler</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Search Filters -->
      <div class="glass-panel mb-3 p-3">
        <div class="d-flex gap-3 align-center">
          <div class="form-group mb-0" style="flex: 1;">
            <input type="text" class="form-control" placeholder="Rechercher par classe..." [(ngModel)]="searchClasse">
          </div>
          <div class="form-group mb-0" style="flex: 1;">
            <input type="text" class="form-control" placeholder="Rechercher par enseignant..." [(ngModel)]="searchEnseignant">
          </div>
          <button class="btn btn-primary" (click)="search()">Rechercher</button>
          <button class="btn btn-outline" (click)="resetSearch()">Réinitialiser</button>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-panel table-container">
        <table class="admin-table w-100">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Enseignant</th>
              <th>Matière</th>
              <th>Classe</th>
              <th>Salle</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let seance of seances">
              <td class="text-muted">#{{seance.id}}</td>
              <td>{{seance.date}}</td>
              <td>{{seance.heureDebut}} - {{seance.heureFin}}</td>
              <td style="font-weight:600">{{seance.enseignant}}</td>
              <td>{{seance.matiere}}</td>
              <td>{{seance.classe}}</td>
              <td>{{seance.salle}}</td>
              <td>
                <span class="type-badge" [class]="'type-' + seance.typeSeance.toLowerCase()">
                  {{seance.typeSeance}}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2 actions-col">
                  <button class="btn-icon" title="Modifier" (click)="editSeance(seance)">✏️</button>
                  <button class="btn-icon danger" title="Supprimer" (click)="deleteSeance(seance.id!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="seances.length === 0">
              <td colspan="9" class="text-center text-muted p-4">Aucune séance disponible.</td>
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
    .type-badge.type-cours { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .type-badge.type-td { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .type-badge.type-tp { background: rgba(168, 85, 247, 0.2); color: #a78bfa; }
    .type-badge.type-examen { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    
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
  `]
})
export class SeancesManagementComponent implements OnInit {
  private seanceService = inject(SeanceService);

  seances: Seance[] = [];
  searchClasse = '';
  searchEnseignant = '';

  showForm = false;
  editing = false;
  currentSeance: Seance = this.getEmptyForm();

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.seanceService.getAll().subscribe({
      next: (data) => this.seances = data,
      error: (err) => console.error(err)
    });
  }

  getEmptyForm(): Seance {
    return { 
      date: '', 
      heureDebut: '', 
      heureFin: '', 
      enseignant: '', 
      matiere: '', 
      classe: '', 
      salle: '', 
      typeSeance: 'Cours' 
    };
  }

  openForm() {
    this.editing = false;
    this.currentSeance = this.getEmptyForm();
    this.showForm = true;
  }

  editSeance(seance: Seance) {
    this.editing = true;
    this.currentSeance = { ...seance };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveSeance() {
    if (this.editing && this.currentSeance.id) {
      this.seanceService.update(this.currentSeance.id, this.currentSeance).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.seanceService.create(this.currentSeance).subscribe({
        next: () => {
          this.loadAll();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteSeance(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette séance?")) {
      this.seanceService.delete(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => console.error(err)
      });
    }
  }

  search() {
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

  resetSearch() {
    this.searchClasse = '';
    this.searchEnseignant = '';
    this.loadAll();
  }
}
