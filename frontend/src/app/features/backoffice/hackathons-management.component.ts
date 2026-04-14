import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HackathonService } from '../../core/services/hackathon.service';
import { Hackathon } from '../../core/models/hackathon.model';
import { finalize } from 'rxjs/operators';
import { Subject, Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-hackathons-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel animate-fade-in">
      <!-- Header Section -->
      <div class="header-status mb-4 d-flex justify-between align-center">
        <div>
          <h2 class="section-title">Hackathon <span class="text-accent">Orchestrator</span></h2>
          <p class="text-muted text-sm">Design, schedule, and manage competitive innovation events.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary btn-glow" (click)="openModal()">+ Forge Hackathon</button>
        </div>
      </div>

      <!-- Search & Sort Bar -->
      <div class="glass-panel search-bar mb-4 p-3">
        <div class="filter-toolbar">
          <div class="input-wrapper grow">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="searchQuery"
              (ngModelChange)="scheduleSearch()"
              placeholder="Locate hackathon by title, location or category..."
              autocomplete="off">
          </div>
          
          <div class="d-flex gap-2 align-center">
            <select [(ngModel)]="sortBy" (change)="loadHackathons()" class="form-control sort-select">
              <option value="id">Sort by Registry ID</option>
              <option value="title">Sort by Designation</option>
              <option value="startDate">Sort by Chronology</option>
            </select>
            <button class="btn btn-outline btn-sm p-2" (click)="toggleDirection()" [title]="direction === 'asc' ? 'Ascending' : 'Descending'">
              {{ direction === 'asc' ? '🔼' : '🔽' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-card glass-panel overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Designation</th>
              <th>Category</th>
              <th>Presence</th>
              <th>Chronology</th>
              <th class="text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of hackathons" class="animate-fade-in">
              <td class="text-muted text-xs">#{{h.id}}</td>
              <td><span class="font-bold text-main">{{h.title}}</span></td>
              <td><span class="status-pill">{{h.category}}</span></td>
              <td><span class="text-sm">📍 {{h.location}}</span></td>
              <td><span class="text-sm date-tag">{{h.startDate | date:'mediumDate'}}</span></td>
              <td>
                <div class="d-flex gap-2 justify-end">
                  <button type="button" class="action-btn" (click)="editHackathon(h)" title="Refine">✏️</button>
                  <button type="button" class="action-btn danger" (click)="deleteHackathon(h.id!)" title="Terminate">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="6" class="empty-row text-center text-accent">Synchronizing with Registry...</td>
            </tr>
            <tr *ngIf="!loading && hackathons.length === 0">
              <td colspan="6" class="empty-row text-center text-muted">No hackathons mapped to current sectors.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Overlay -->
      <div class="modal-overlay" *ngIf="isModalOpen">
        <div class="glass-panel modal-pane animate-fade-in">
          <header class="modal-header">
            <h3 class="text-primary">{{currentHackathon.id ? 'Refine' : 'Blueprint'}} Hackathon</h3>
            <button class="close-modal" (click)="closeModal()">&times;</button>
          </header>
          
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Event Title</label>
              <input type="text" [(ngModel)]="currentHackathon.title" class="form-control" placeholder="e.g. AI-Gen Innovation 2024">
            </div>
            <div class="form-group">
              <label>Sector Category</label>
              <input type="text" [(ngModel)]="currentHackathon.category" class="form-control" placeholder="Web3, AI, etc.">
            </div>
            <div class="form-group">
              <label>Presence/Location</label>
              <input type="text" [(ngModel)]="currentHackathon.location" class="form-control" placeholder="Remote / City">
            </div>
            <div class="form-group">
              <label>Launch Timestamp</label>
              <input type="datetime-local" [(ngModel)]="currentHackathon.startDate" class="form-control">
            </div>
            <div class="form-group">
              <label>Conclusion Timestamp</label>
              <input type="datetime-local" [(ngModel)]="currentHackathon.endDate" class="form-control">
            </div>
            <div class="form-group span-2">
              <label>Strategic Vision (Description)</label>
              <textarea [(ngModel)]="currentHackathon.description" class="form-control" rows="4" placeholder="Detail the hackathon goals and rewards..."></textarea>
            </div>
          </div>

          <footer class="modal-footer d-flex gap-3 mt-5">
            <button class="btn btn-primary btn-glow btn-grow" (click)="saveHackathon()" [disabled]="!currentHackathon.title">Execute Registry Update</button>
            <button class="btn btn-outline" (click)="closeModal()">Abort</button>
          </footer>
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
    .input-wrapper .form-control { padding-left: 2.8rem; background: rgba(0,0,0,0.2); }
    .sort-select { width: 220px; font-size: 0.85rem; }

    /* Modern Table */
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: rgba(255,255,255,0.02); padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
    
    .status-pill { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 20px; background: rgba(99, 102, 241, 0.1); color: var(--primary); font-weight: 700; border: 1px solid rgba(99, 102, 241, 0.2); }
    .date-tag { color: var(--success); font-family: monospace; font-weight: 600; }

    /* Actions */
    .action-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 0.5rem; border-radius: 10px; cursor: pointer; transition: var(--transition); font-size: 1.1rem; line-height: 1; }
    .action-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .action-btn.danger:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-pane { width: 100%; max-width: 650px; padding: 2.5rem; border-radius: 24px; max-height: 90vh; overflow-y: auto; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .span-2 { grid-column: span 2; }
    .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; align-items: center; }
    .close-modal { background: transparent; border: none; font-size: 2rem; color: var(--text-muted); cursor: pointer; line-height: 1; }
    .close-modal:hover { color: var(--text-main); }

    .btn-grow { flex: 1; }
    .justify-end { justify-content: flex-end; }
    .text-right { text-align: right; }
    .empty-row { padding: 4rem !important; }
    .grow { flex: 1; }
  `]
})
export class HackathonsManagementComponent implements OnInit {
  private hackathonService = inject(HackathonService);
  private searchBus = new Subject<void>();
  private searchSub?: Subscription;

  hackathons: Hackathon[] = [];
  loading = false;
  searchQuery = '';
  sortBy = 'id';
  direction: 'asc' | 'desc' = 'desc';
  isModalOpen = false;
  currentHackathon: Hackathon = this.RESET_HACKATHON();

  ngOnInit() {
    this.searchSub = this.searchBus.pipe(debounceTime(400)).subscribe(() => this.loadHackathons());
    this.loadHackathons();
  }

  scheduleSearch() {
    this.searchBus.next();
  }

  loadHackathons() {
    this.loading = true;
    this.hackathonService.getAll(this.searchQuery.trim(), this.sortBy, this.direction)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.hackathons = data,
        error: err => console.error('Registry Sync Error:', err)
      });
  }

  toggleDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.loadHackathons();
  }

  openModal() {
    this.currentHackathon = this.RESET_HACKATHON();
    this.isModalOpen = true;
  }

  editHackathon(h: Hackathon) {
    this.currentHackathon = { ...h };
    this.isModalOpen = true;
  }

  saveHackathon() {
    const api = this.currentHackathon.id 
      ? this.hackathonService.update(this.currentHackathon.id, this.currentHackathon)
      : this.hackathonService.create(this.currentHackathon);

    api.subscribe({
      next: () => {
        this.loadHackathons();
        this.closeModal();
      },
      error: (err) => {
        console.error('Operation Failed:', err);
        alert('Registry Error: Could not synchronize data.');
      }
    });
  }

  deleteHackathon(id: number) {
    if (confirm('Terminate this hackathon? This action cannot be reversed.')) {
      this.hackathonService.delete(id).subscribe(() => this.loadHackathons());
    }
  }

  closeModal() { this.isModalOpen = false; }

  private RESET_HACKATHON() {
    return { title: '', description: '', location: '', startDate: '', endDate: '', category: '' };
  }
}
