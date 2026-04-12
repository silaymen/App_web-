import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar glass-panel">
      <div class="container d-flex justify-between align-center">
        <a routerLink="/" class="logo">
          <span class="text-primary">EZ</span><span class="text-accent">Learning</span>
        </a>
        <div class="nav-links d-flex gap-3">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/admin" routerLinkActive="active">Admin Desk</a>
        </div>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <div class="container text-center text-muted">
        <p>&copy; 2026 EZLearning Formation Services. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1rem 0;
      border-radius: 0 0 16px 16px;
      margin-bottom: 2rem;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .nav-links a {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: var(--transition);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.1);
    }
    main {
      min-height: calc(100vh - 180px);
    }
    footer {
      padding: 2rem 0;
      font-size: 0.85rem;
      border-top: 1px solid var(--border);
      margin-top: 2rem;
    }
  `]
})
export class AppComponent {
  title = 'frontend';
}
