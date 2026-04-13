import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly adminUrl = 'http://localhost:8000/api/users/admin';
  private readonly publicUrl = 'http://localhost:8000/api/users';

  loadMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.publicUrl}/me`);
  }

  getAllUsers(params?: any): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminUrl}/all`, { params });
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.adminUrl}/update/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/delete/${id}`);
  }
}
