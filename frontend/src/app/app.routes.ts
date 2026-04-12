import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/frontoffice/frontoffice.component').then(m => m.FrontofficeComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/backoffice/backoffice.component').then(m => m.BackofficeComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
