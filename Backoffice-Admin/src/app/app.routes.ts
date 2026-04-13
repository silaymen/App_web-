import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CertificationListComponent } from './components/certification-list/certification-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'certifications', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'certifications', component: CertificationListComponent },
  { path: '**', redirectTo: 'certifications' }
];
