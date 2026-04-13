import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-fade-in">
      <div class="glass-panel control-bar mb-4">
        <div class="filter-field grow">
          <h2 class="section-title">User <span class="text-primary">Registry</span></h2>
          <p class="text-xs text-muted">Manage synchronized users and their permissions.</p>
        </div>
        <div class="filter-actions d-flex gap-2 align-center">
          <input type="text" class="form-control form-control-sm" placeholder="Search users..." [(ngModel)]="searchQuery" (input)="onSearch()">
          <select class="form-control form-control-sm" [(ngModel)]="selectedRole" (change)="loadUsers()">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
          <select class="form-control form-control-sm" [(ngModel)]="sortBy" (change)="loadUsers()">
            <option value="username">Sort: Username</option>
            <option value="firstName">Sort: First Name</option>
            <option value="email">Sort: Email</option>
          </select>
          <button class="btn btn-outline btn-sm" (click)="toggleDirection()">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </button>
          <button class="btn btn-primary btn-sm" (click)="loadUsers()" [disabled]="isLoading">
            Search
          </button>
        </div>
      </div>

      <!-- Error Alert -->
      <div class="error-alert mb-4" *ngIf="errorMessage">
        <span>⚠️ {{ errorMessage }}</span>
      </div>

      <div class="table-card glass-panel overflow-hidden">
        <table class="premium-table">
          <thead>
            <tr>
              <th>User Identity</th>
              <th>Email Address</th>
              <th>System Roles</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="d-flex flex-col">
                  <span class="font-bold text-main">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="text-xs text-muted">{{ user.username }}</span>
                </div>
              </td>
              <td><span class="text-sm text-main">{{ user.email }}</span></td>
              <td>
                <div class="d-flex gap-1 flex-wrap">
                  <span *ngFor="let role of user.roles" class="badge-tag">{{ role }}</span>
                </div>
              </td>
              <td>
                <div class="d-flex gap-2 justify-end">
                  <button class="action-btn" (click)="editUser(user)" title="Edit Profile">✏️</button>
                  <button class="action-btn danger" (click)="deleteUser(user.id)" title="Remove User">🗑️</button>
                </div>
              </td>
            </tr>

            <!-- Loading State -->
            <tr *ngIf="isLoading && users.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">
                <p>Loading synchronization data...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="!isLoading && users.length === 0 && !errorMessage">
              <td colspan="4" class="empty-row text-center text-muted">
                <div class="py-4">
                  <p>No synchronized users found.</p>
                  <p class="text-xs">Users are automatically added to this registry when they first log in.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="showEditModal">
        <div class="glass-panel modal-pane animate-fade-in text-main">
          <header class="modal-header">
            <h3>Refine User Profile</h3>
            <button class="close-modal" (click)="closeModal()">&times;</button>
          </header>
          <div class="modal-body">
            <div class="form-grid pt-4">
              <div class="form-group span-2">
                <label>First Name</label>
                <input type="text" class="form-control" name="firstName" [(ngModel)]="currentUser.firstName">
              </div>
              <div class="form-group span-2">
                <label>Last Name</label>
                <input type="text" class="form-control" name="lastName" [(ngModel)]="currentUser.lastName">
              </div>
            </div>
            <div class="info-note mt-4">
              Note: Username and Email are managed in Keycloak and cannot be modified here.
            </div>
          </div>
          <footer class="modal-footer d-flex gap-3 mt-5">
            <button class="btn btn-primary btn-grow" (click)="saveUser()" [disabled]="isSaving">
              {{ isSaving ? 'Applying Changes...' : 'Save Changes' }}
            </button>
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem; }
    .control-bar { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .grow { flex: 1; }
    .badge-tag {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .text-main { color: var(--text-main); }
    .modal-pane { max-width: 500px; padding: 2rem; width: 100%; }
    .action-btn.danger:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }
    .info-note {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--text-muted);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.75rem;
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];
  showEditModal = false;
  currentUser: any = {};
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;

  searchQuery = '';
  selectedRole = '';
  sortBy = 'username';
  sortDirection = 'asc';
  private searchSubject = new Subject<string>();

  ngOnInit() { 
    this.loadUsers();
    
    // Setup dynamic search with debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  toggleDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = null;

    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedRole) params.role = this.selectedRole;
    if (this.sortBy) params.sortBy = this.sortBy;
    if (this.sortDirection) params.direction = this.sortDirection;

    this.userService.getAllUsers(params).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Registry Error:', err);
        this.errorMessage = err.status === 403
          ? 'Access Denied (403): Your account does not have the ADMIN role required to view the User Registry.'
          : 'Failed to fetch user data. Please ensure the user-service is running and accessible.';
        this.isLoading = false;
      }
    });
  }

  editUser(user: User) {
    this.currentUser = JSON.parse(JSON.stringify(user));
    this.showEditModal = true;
  }

  closeModal() { this.showEditModal = false; }

  saveUser() {
    if (this.currentUser.id) {
      this.isSaving = true;
      this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe({
        next: () => {
          this.loadUsers();
          this.isSaving = false;
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          alert('Failed to update profile. Please try again.');
        }
      });
    }
  }

  deleteUser(id: string) {
    if (confirm('Remove this user from the local database? This will NOT delete them from Keycloak. They will be re-synced on next login.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => {
          console.error(err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}
