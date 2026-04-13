import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificationService, Certification } from '../../services/certification.service';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certifications.component.html',
  styleUrl: './certifications.component.css'
})
export class CertificationsComponent implements OnInit {
  certifications: Certification[] = [];
  loading = true;
  error = '';
  backendOffline = false;

  // Search and Sort State
  searchTerm = '';
  sortBy = 'id';
  sortDir = 'asc';

  isModalOpen = false;
  isEditMode = false;
  currentCert: Certification = this.getEmptyCert();

  constructor(private certService: CertificationService) {}

  ngOnInit() {
    this.fetchData();
  }

  getEmptyCert(): Certification {
    return { name: '', description: '', version: '', validityDays: 365, issueDate: '', expiryDate: '', ownerEmail: '' };
  }

  fetchData() {
    this.loading = true;
    this.certService.getCertifications(this.searchTerm, this.sortBy, this.sortDir).subscribe({
      next: (data) => {
        this.certifications = data;
        this.loading = false;
        this.backendOffline = false;
      },
      error: (err) => {
        this.error = 'Backend is offline. Running in Local Mock Mode.';
        this.loading = false;
        this.backendOffline = true;
        this.loadMockData();
      }
    });
  }

  onSearchChange() {
    this.fetchData();
  }

  onSort(field: string) {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.fetchData();
  }

  loadMockData() {
    this.certifications = [
      { id: 1, name: 'AWS Certified Solutions Architect', description: 'Cloud architectural knowledge.', version: 'v1.2', validityDays: 1095, issueDate: '2025-01-10', expiryDate: '2028-01-10', ownerEmail: 'admin@cloud.com' },
      { id: 2, name: 'Spring Boot Certified Developer', description: 'Expertise in Spring components.', version: 'v3.0', validityDays: 730, issueDate: '2026-03-01', expiryDate: '2028-03-01', ownerEmail: 'java@system.com' },
    ];
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentCert = this.getEmptyCert();
    this.isModalOpen = true;
  }

  openEditModal(cert: Certification) {
    this.isEditMode = true;
    this.currentCert = { ...cert }; 
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCertification() {
    if (this.backendOffline) {
      if (this.isEditMode) {
        const idx = this.certifications.findIndex(c => c.id === this.currentCert.id);
        if(idx !== -1) this.certifications[idx] = { ...this.currentCert };
      } else {
        const newId = Math.max(0, ...this.certifications.map(c => c.id || 0)) + 1;
        this.certifications.push({ ...this.currentCert, id: newId });
      }
      this.closeModal();
      return;
    }

    if (this.isEditMode && this.currentCert.id) {
      this.certService.updateCertification(this.currentCert.id, this.currentCert).subscribe({
        next: () => { this.fetchData(); this.closeModal(); },
        error: (err) => console.error(err)
      });
    } else {
      this.certService.addCertification(this.currentCert).subscribe({
        next: () => { this.fetchData(); this.closeModal(); },
        error: (err) => console.error(err)
      });
    }
  }

  deleteCertification(id: number | undefined) {
    if(!id) return;
    if(confirm('Are you sure you want to delete this Certification?')) {
      if(this.backendOffline) {
        this.certifications = this.certifications.filter(c => c.id !== id);
      } else {
        this.certService.deleteCertification(id).subscribe({
          next: () => this.fetchData(),
          error: (err) => console.error(err)
        });
      }
    }
  }
}
