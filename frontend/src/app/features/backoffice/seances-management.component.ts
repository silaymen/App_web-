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
    <div class="admin-panel animate-fade-in shadow-xl">
      <div class="header-status mb-4 d-flex justify-between align-center">
        <div>
          <h2 class="section-title">Academic <span class="text-primary">Scheduler</span></h2>
          <p class="text-muted text-sm">Coordinate and synchronize learning sessions across the campus.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-glow" (click)="openForm()">+ Schedule Session</button>
        </div>
      </div>

      <div class="glass-panel search-bar mb-4 p-4">
        <div class="filter-row-grid">
          <div class="input-wrapper">
            <label>Vertical Unit (Class)</label>
            <input type="text" class="form-control" placeholder="Search by class..." [(ngModel)]="searchClasse">
          </div>
          <div class="input-wrapper">
            <label>Instructor</label>
            <input type="text" class="form-control" placeholder="Search by instructor..." [(ngModel)]="searchEnseignant">
          </div>
          <div class="filter-btns d-flex gap-2">
            <button class="btn btn-primary" (click)="search()">Identify</button>
            <button class="btn btn-outline" (click)="resetSearch()">Reset</button>
          </div>
        </div>
      </div>

      <div class="table-card glass-panel overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Instructor</th>
              <th>Space</th>
              <th>Unit</th>
              <th>Modality</th>
              <th class="text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let seance of seances">
              <td>
                <div class="d-flex flex-col">
                  <span class="font-bold">{{seance.matiere}}</span>
                  <span class="text-xs text-muted">{{seance.date | date:'mediumDate'}} | {{seance.heureDebut}} - {{seance.heureFin}}</span>
                </div>
              </td>
              <td class="font-semibold">{{seance.enseignant}}</td>
              <td><span class="room-tag">Room {{seance.salle}}</span></td>
              <td><span class="class-tag">{{seance.classe}}</span></td>
              <td><span class="type-pill" [class]="seance.typeSeance.toLowerCase()">{{seance.typeSeance}}</span></td>
              <td>
                <div class="d-flex gap-2 justify-end">
                  <button class="action-btn" (click)="editSeance(seance)" title="Reschedule">✏️</button>
                  <button class="action-btn danger" (click)="deleteSeance(seance.id!)" title="Abort">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="seances.length === 0">
              <td colspan="6" class="empty-row text-center text-muted">No tactical sessions scheduled for this window.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Form Overlay -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="glass-panel modal-pane animate-fade-in">
          <header class="modal-header">
            <h3>{{ editing ? 'Reschedule' : 'Initialize' }} Session</h3>
            <button class="close-modal" (click)="closeForm()">&times;</button>
          </header>
          <form (ngSubmit)="saveSeance()" class="modal-body">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Date of Engagement</label>
                <input type="date" class="form-control" name="date" [(ngModel)]="currentSeance.date" required>
              </div>
              <div class="form-group">
                <label>Commencement</label>
                <input type="time" class="form-control" name="heureDebut" [(ngModel)]="currentSeance.heureDebut" required>
              </div>
              <div class="form-group">
                <label>Conclusion</label>
                <input type="time" class="form-control" name="heureFin" [(ngModel)]="currentSeance.heureFin" required>
              </div>
              <div class="form-group span-2">
                <label>Lead Instructor</label>
                <input type="text" class="form-control" name="enseignant" [(ngModel)]="currentSeance.enseignant" required>
              </div>
              <div class="form-group span-2">
                <label>Subject Matter (Topic)</label>
                <input type="text" class="form-control" name="matiere" [(ngModel)]="currentSeance.matiere" required>
              </div>
              <div class="form-group">
                <label>Target Class (Level)</label>
                <input type="text" class="form-control" name="classe" [(ngModel)]="currentSeance.classe" required>
              </div>
              <div class="form-group">
                <label>Strategic Space (Room)</label>
                <input type="text" class="form-control" name="salle" [(ngModel)]="currentSeance.salle" required>
              </div>
              <div class="form-group span-2">
                <label>Engagement Modality</label>
                <select class="form-control" name="typeSeance" [(ngModel)]="currentSeance.typeSeance" required>
                  <option value="Cours">Cours (Standard Lecture)</option>
                  <option value="TD">TD (Practical Session)</option>
                  <option value="TP">TP (Laboratory Work)</option>
                  <option value="Examen">Examen (Evaluation)</option>
                </select>
              </div>
            </div>
            <footer class="modal-footer d-flex gap-3 mt-5">
              <button type="submit" class="btn btn-primary btn-grow">Confirm Schedule</button>
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
    .font-semibold { font-weight: 600; }

    .filter-row-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1.25rem; align-items: flex-end; }
    .filter-row-grid label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }

    /* Premium Table */
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
    
    .room-tag { font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border); }
    .class-tag { font-weight: 700; color: var(--primary); }
    
    .type-pill { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .type-pill.cours { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
    .type-pill.td { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .type-pill.tp { background: rgba(217, 70, 239, 0.1); color: var(--accent); }
    .type-pill.examen { background: rgba(239, 68, 68, 0.1); color: var(--danger); box-shadow: 0 0 10px rgba(239, 68, 68, 0.15); }

    /* Actions */
    .action-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 0.4rem; border-radius: 8px; cursor: pointer; transition: var(--transition); }
    .action-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .action-btn.danger:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-pane { width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 24px; max-height: 90vh; overflow-y: auto; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .span-2 { grid-column: span 2; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .close-modal { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

    .btn-grow { flex: 1; }
    .justify-end { justify-content: flex-end; }
    .text-right { text-align: right; }
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
