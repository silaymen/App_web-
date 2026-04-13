import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certification } from '../models/certification.model';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private readonly apiUrl = `${environment.apiGatewayUrl}/certifications`;

  constructor(private http: HttpClient) {}

  getCertifications(search = '', sortBy = 'id', direction = 'asc'): Observable<Certification[]> {
    if (search && search.trim()) {
      return this.http.get<Certification[]>(`${this.apiUrl}/search`, {
        params: { name: search.trim() }
      });
    }
    return this.http.get<Certification[]>(this.apiUrl);
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
