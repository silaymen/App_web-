import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hackathon } from '../models/hackathon.model';

@Injectable({
  providedIn: 'root'
})
export class HackathonService {
  private apiUrl = 'http://localhost:8000/hackathons';

  constructor(private http: HttpClient) {}

  getAll(search?: string, sortBy?: string, direction?: string): Observable<Hackathon[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (direction) params = params.set('direction', direction);
    return this.http.get<Hackathon[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.apiUrl}/${id}`);
  }

  create(hackathon: Hackathon): Observable<Hackathon> {
    return this.http.post<Hackathon>(this.apiUrl, hackathon);
  }

  update(id: number, hackathon: Hackathon): Observable<Hackathon> {
    return this.http.put<Hackathon>(`${this.apiUrl}/${id}`, hackathon);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
