import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="main-layout">
      <nav class="navbar-wrapper">
        <div class="navbar glass-panel animate-fade-in">
          <div class="container d-flex justify-between align-center">
            <a routerLink="/" class="logo">
              <span class="text-primary">EZ</span><span class="logo-accent">Learning</span>
            </a>
            <div class="nav-links d-flex gap-3 align-center">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
              <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin Desk</a>
              
              <div class="v-divider"></div>

              <div *ngIf="isLoggedIn" class="user-info d-flex align-center gap-2">
                <span class="username">{{ username }}</span>
                <button (click)="logout()" class="btn btn-logout">
                  <span class="icon">Logout</span>
                </button>
              </div>
              <div *ngIf="!isLoggedIn" class="user-auth">
                <button (click)="login()" class="btn btn-primary btn-glow">Login</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="content-area animate-fade-in" style="animation-delay: 0.2s">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer animate-fade-in" style="animation-delay: 0.4s">
        <div class="container d-flex justify-between align-center">
          <p class="text-muted">&copy; 2026 EZLearning. Shaping future talents.</p>
          <div class="footer-links d-flex gap-3">
            <a href="#" class="text-muted">Privacy</a>
            <a href="#" class="text-muted">Support</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .navbar-wrapper {
      position: sticky;
      top: 1.5rem;
      z-index: 1000;
      padding: 0 1rem;
      width: 100%;
    }
    .navbar {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-xl);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -1px;
      display: flex;
      align-items: center;
    }
    .logo-accent {
      color: var(--text-main);
      opacity: 0.9;
    }
    .nav-links a {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: var(--transition);
      padding: 0.5rem 1rem;
      border-radius: 12px;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.1);
    }
    .v-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 0.5rem;
    }
    .username {
      font-weight: 700;
      background: linear-gradient(135deg, var(--text-main), var(--text-muted));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 0.9rem;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .btn-logout:hover {
      background: var(--danger);
      color: white;
    }
    .btn-glow::after {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 12px;
      z-index: -1;
      filter: blur(8px);
      opacity: 0;
      transition: var(--transition);
    }
    .btn-glow:hover::after {
      opacity: 0.5;
    }
    .content-area {
      flex: 1;
      padding: 4rem 0;
    }
    .footer {
      padding: 3rem 0;
      border-top: 1px solid var(--border);
      background: rgba(0, 0, 0, 0.2);
    }
    .footer-links a:hover {
      color: var(--primary);
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  private userService = inject(UserService);

  constructor(
    private readonly keycloak: KeycloakService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    try {
      this.isLoggedIn = await this.keycloak.isLoggedIn();
      
      if (this.isLoggedIn) {
        const userProfile = await this.keycloak.loadUserProfile();
        this.username = userProfile.username || '';
        
        // Trigger synchronization with the backend and use its results for redirection
        this.userService.loadMyProfile().subscribe({
          next: (syncedUser) => {
            // Only redirect if at the root path to avoid disrupting specific navigation
            const path = window.location.pathname;
            if (path === '/' || path === '') {
              // Pass the roles from the sync call (which includes our default "USER" role)
              this.redirectBasedOnRoles(syncedUser.roles || []);
            }
          },
          error: (err) => {
            console.error('AppComponent: Sync failed, falling back to Keycloak roles', err);
            // Fallback to Keycloak roles if sync fails
            const path = window.location.pathname;
            if (path === '/' || path === '') {
              this.redirectBasedOnRoles(this.keycloak.getUserRoles());
            }
          }
        });
      }
    } catch (error) {
      console.error('AppComponent: Error during initialization', error);
      this.isLoggedIn = false;
    }
  }

  private redirectBasedOnRoles(roles: string[]) {
    // Normalize roles to lowercase for comparison
    const normalizedRoles = roles.map(r => r.toLowerCase());
    
    if (normalizedRoles.includes('admin')) {
      this.router.navigate(['/admin']);
    } else {
      // Default for all other users (including new registrations with the "USER" role)
      this.router.navigate(['/']);
    }
  }

  login() {
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
