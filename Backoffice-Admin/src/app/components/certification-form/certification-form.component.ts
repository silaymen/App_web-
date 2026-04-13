import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CertificationService, Certification } from '../../services/certification.service';

@Component({
  selector: 'app-certification-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './certification-form.component.html',
  styleUrl: './certification-form.component.css'
})
export class CertificationFormComponent implements OnInit {
  certification: Certification = {
    name: '',
    description: '',
    version: 'v1.0',
    validityDays: 365,
    issueDate: '',
    expiryDate: '',
    ownerEmail: ''
  };
  isEdit: boolean = false;

  constructor(
    private certificationService: CertificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.certificationService.getCertificationById(+id).subscribe(data => {
        this.certification = data;
      });
    }
  }

  saveCertification(): void {
    if (this.isEdit && this.certification.id) {
      this.certificationService.updateCertification(this.certification.id, this.certification)
        .subscribe(() => this.router.navigate(['/certifications']));
    } else {
      this.certificationService.createCertification(this.certification)
        .subscribe(() => this.router.navigate(['/certifications']));
    }
  }
}
