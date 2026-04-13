import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Formation, Page } from '../models/formation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getActive(page: number = 0, size: number = 10): Observable<Page<Formation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Formation>>(`${this.apiUrl}/active`, { params });
  }

  getById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  searchByTitle(title: string): Observable<Formation[]> {
    let params = new HttpParams().set('title', title);
    return this.http.get<Formation[]>(`${this.apiUrl}/search`, { params });
  }

  filterByCategory(categorie: string): Observable<Formation[]> {
    let params = new HttpParams().set('categorie', categorie);
    return this.http.get<Formation[]>(`${this.apiUrl}/category`, { params });
  }

  create(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }

  update(id: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deactivate(id: number): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/deactivate/${id}`, {});
  }
}
