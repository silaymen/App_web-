import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Certification {
  id?: number;
  name: string;
  description: string;
  version: string;
  validityDays: number;
  issueDate: string;
  expiryDate: string;
  ownerEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getCertifications(search: string = '', sortBy: string = 'id', direction: string = 'asc'): Observable<Certification[]> {
    let params = new HttpParams()
      .set('search', search)
      .set('sortBy', sortBy)
      .set('direction', direction);
    return this.http.get<Certification[]>(this.apiUrl, { params });
  }

  getCertificationById(id: number): Observable<Certification> {
    return this.http.get<Certification>(`${this.apiUrl}/${id}`);
  }

  createCertification(cert: Certification): Observable<Certification> {
    return this.http.post<Certification>(this.apiUrl, cert);
  }

  updateCertification(id: number, cert: Certification): Observable<Certification> {
    return this.http.put<Certification>(`${this.apiUrl}/${id}`, cert);
  }

  deleteCertification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
