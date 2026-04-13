import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Seance, Page } from '../models/seance.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeanceService {
  private apiUrl = `${environment.apiGatewayUrl}/seances`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Seance[]> {
    return this.http.get<Seance[]>(this.apiUrl);
  }

  getById(id: number): Observable<Seance> {
    return this.http.get<Seance>(`${this.apiUrl}/${id}`);
  }

  searchByClasse(classe: string, page: number = 0, size: number = 5): Observable<Page<Seance>> {
    let params = new HttpParams()
      .set('classe', classe)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Seance>>(`${this.apiUrl}/search/classe`, { params });
  }

  searchByEnseignant(nom: string, page: number = 0, size: number = 5): Observable<Page<Seance>> {
    let params = new HttpParams()
      .set('nom', nom)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Seance>>(`${this.apiUrl}/search/enseignant`, { params });
  }

  create(seance: Seance): Observable<Seance> {
    return this.http.post<Seance>(this.apiUrl, seance);
  }

  update(id: number, seance: Seance): Observable<Seance> {
    return this.http.put<Seance>(`${this.apiUrl}/${id}`, seance);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
