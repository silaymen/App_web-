import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationService, Certification } from '../../services/certification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalCertifications: number = 0;
  activeCertifications: number = 0;
  expiringSoon: number = 0;
  recentCertifications: Certification[] = [];

  constructor(private certificationService: CertificationService) {}

  ngOnInit(): void {
    this.certificationService.getCertifications().subscribe(data => {
      const now = new Date();
      this.totalCertifications = data.length;
      this.activeCertifications = data.filter(c => !c.expiryDate || new Date(c.expiryDate) > now).length;
      this.expiringSoon = data.filter(c => {
        if (!c.expiryDate) return false;
        const expiry = new Date(c.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays <= 30;
      }).length;
      this.recentCertifications = data.slice(0, 5);
    });
  }
}
