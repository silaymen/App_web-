import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Certification {
  id?: number;
  name: string;
  description?: string;
  version?: string;
  validityDays?: number;
  issueDate?: string;
  expiryDate?: string;
  ownerEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private apiUrl = `${environment.gatewayUrl}/certifications`;

  constructor(private http: HttpClient) {}

  getCertifications(search: string = '', sortBy: string = 'id', direction: string = 'asc'): Observable<Certification[]> {
    const params: any = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (direction) params.direction = direction;
    
    return this.http.get<Certification[]>(this.apiUrl, { params });
  }

  getCertificationById(id: number): Observable<Certification> {
    return this.http.get<Certification>(`${this.apiUrl}/${id}`);
  }

  addCertification(cert: Certification): Observable<Certification> {
    return this.http.post<Certification>(this.apiUrl, cert);
  }

  updateCertification(id: number, cert: Certification): Observable<Certification> {
    return this.http.put<Certification>(`${this.apiUrl}/${id}`, cert);
  }

  deleteCertification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
