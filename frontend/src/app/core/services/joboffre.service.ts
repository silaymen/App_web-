import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JobOffre } from '../models/joboffre.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobOffreService {
  private apiUrl = `${environment.apiGatewayUrl}/joboffers`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<JobOffre[]> {
    return this.http.get<JobOffre[]>(this.apiUrl);
  }

  getById(id: number): Observable<JobOffre> {
    return this.http.get<JobOffre>(`${this.apiUrl}/${id}`);
  }

  create(jobOffre: JobOffre): Observable<JobOffre> {
    return this.http.post<JobOffre>(this.apiUrl, jobOffre);
  }

  update(id: number, jobOffre: JobOffre): Observable<JobOffre> {
    return this.http.put<JobOffre>(`${this.apiUrl}/${id}`, jobOffre);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
