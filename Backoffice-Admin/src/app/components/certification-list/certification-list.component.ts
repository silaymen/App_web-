import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CertificationService, Certification } from '../../services/certification.service';

@Component({
  selector: 'app-certification-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './certification-list.component.html',
  styleUrl: './certification-list.component.css'
})
export class CertificationListComponent implements OnInit {

  // Raw data from backend (or mock)
  private allCertifications: Certification[] = [];

  // What's shown in the table (filtered + sorted)
  displayedCertifications: Certification[] = [];

  loading = true;
  error = '';
  backendOffline = false;

  // ── Search & Sort ──────────────────────────────────────────
  searchTerm = '';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  // ── Modal ──────────────────────────────────────────────────
  isModalOpen = false;
  isEditMode = false;
  isSaving = false;
  currentCert: Certification = this.emptyForm();

  // ── Toast ──────────────────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any;

  constructor(private certService: CertificationService) {}

  ngOnInit(): void {
    this.loadFromBackend();
  }

  // ─────────────────────────────────────────────────────────────
  //  DATA LOADING
  // ─────────────────────────────────────────────────────────────

  loadFromBackend(): void {
    this.loading = true;
    this.certService.getCertifications().subscribe({
      next: (data) => {
        this.allCertifications = data;
        this.loading = false;
        this.backendOffline = false;
        this.error = '';
        this.applyFilterAndSort();
      },
      error: () => {
        this.backendOffline = true;
        this.loading = false;
        this.error = '⚠️ Backend offline – running in local mock mode.';
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    this.allCertifications = [
      { id: 1, name: 'AWS Certified Solutions Architect', description: 'Cloud architecture expertise.', version: 'v1.2', validityDays: 1095, issueDate: '2025-01-10', expiryDate: '2028-01-10', ownerEmail: 'admin@cloud.com' },
      { id: 2, name: 'Spring Boot Certified Developer', description: 'Expertise in Spring components.', version: 'v3.0', validityDays: 730, issueDate: '2026-03-01', expiryDate: '2028-03-01', ownerEmail: 'java@system.com' },
      { id: 3, name: 'Certified Kubernetes Administrator', description: 'Container orchestration mastery.', version: 'v1.29', validityDays: 365, issueDate: '2026-01-15', expiryDate: '2027-01-15', ownerEmail: 'devops@k8s.io' },
      { id: 4, name: 'Google Associate Cloud Engineer', description: 'GCP infrastructure management.', version: 'v2.0', validityDays: 730, issueDate: '2025-06-01', expiryDate: '2027-06-01', ownerEmail: 'gcp@google.com' },
    ];
    this.applyFilterAndSort();
  }

  // ─────────────────────────────────────────────────────────────
  //  CLIENT-SIDE FILTER + SORT  (always instant, no API calls)
  // ─────────────────────────────────────────────────────────────

  applyFilterAndSort(): void {
    let result = [...this.allCertifications];

    // 1. Filter by search term (case-insensitive, matches name, description, ownerEmail, version)
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(c =>
        (c.name?.toLowerCase().includes(term)) ||
        (c.description?.toLowerCase().includes(term)) ||
        (c.version?.toLowerCase().includes(term)) ||
        (c.ownerEmail?.toLowerCase().includes(term))
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      const field = this.sortBy as keyof Certification;
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    this.displayedCertifications = result;
  }

  onSearchChange(): void {
    this.applyFilterAndSort();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.applyFilterAndSort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilterAndSort();
  }

  // ─────────────────────────────────────────────────────────────
  //  MODAL
  // ─────────────────────────────────────────────────────────────

  emptyForm(): Certification {
    return { name: '', description: '', version: 'v1.0', validityDays: 365, issueDate: '', expiryDate: '', ownerEmail: '' };
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCert = this.emptyForm();
    this.isModalOpen = true;
  }

  openEditModal(cert: Certification): void {
    this.isEditMode = true;
    this.currentCert = { ...cert };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isSaving = false;
  }

  // ─────────────────────────────────────────────────────────────
  //  CREATE / UPDATE
  // ─────────────────────────────────────────────────────────────

  saveCertification(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    if (this.backendOffline) {
      this.saveLocally();
      return;
    }

    if (this.isEditMode && this.currentCert.id) {
      this.certService.updateCertification(this.currentCert.id, this.currentCert).subscribe({
        next: () => { this.closeModal(); this.loadFromBackend(); this.showToast('Certification updated!', 'success'); },
        error: () => { this.isSaving = false; this.showToast('Update failed – saved locally.', 'error'); this.saveLocally(); }
      });
    } else {
      this.certService.createCertification(this.currentCert).subscribe({
        next: () => { this.closeModal(); this.loadFromBackend(); this.showToast('Certification created!', 'success'); },
        error: () => { this.isSaving = false; this.showToast('Creation failed – saved locally.', 'error'); this.saveLocally(); }
      });
    }
  }

  private saveLocally(): void {
    if (this.isEditMode && this.currentCert.id) {
      const idx = this.allCertifications.findIndex(c => c.id === this.currentCert.id);
      if (idx !== -1) { this.allCertifications[idx] = { ...this.currentCert }; }
    } else {
      const newId = Math.max(0, ...this.allCertifications.map(c => c.id ?? 0)) + 1;
      this.allCertifications.push({ ...this.currentCert, id: newId });
    }
    this.closeModal();
    this.applyFilterAndSort();
  }

  // ─────────────────────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────────────────────

  deleteCertification(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this certification? This cannot be undone.')) return;

    if (this.backendOffline) {
      this.allCertifications = this.allCertifications.filter(c => c.id !== id);
      this.applyFilterAndSort();
      this.showToast('Deleted locally.', 'success');
      return;
    }

    this.certService.deleteCertification(id).subscribe({
      next: () => {
        // Remove instantly from local array then refresh
        this.allCertifications = this.allCertifications.filter(c => c.id !== id);
        this.applyFilterAndSort();
        this.showToast('Certification deleted.', 'success');
        this.loadFromBackend();
      },
      error: () => this.showToast('Delete failed. Please try again.', 'error')
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  TOAST
  // ─────────────────────────────────────────────────────────────

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
  }

  // ─────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────

  trackById(_: number, cert: Certification): number {
    return cert.id ?? 0;
  }

  isExpiringSoon(expiryDate: string | undefined): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 30;
  }
}
