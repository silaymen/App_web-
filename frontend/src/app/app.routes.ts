import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/frontoffice/frontoffice.component').then(m => m.FrontofficeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/backoffice/backoffice.component').then(m => m.BackofficeComponent),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
