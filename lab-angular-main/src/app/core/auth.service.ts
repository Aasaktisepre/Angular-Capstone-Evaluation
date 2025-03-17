import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private sessionStartTime: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  checkDuplicateEmail(email: string): Observable<{ isDuplicate: boolean; users: User[] }> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => ({ isDuplicate: users.some(user => user.email.toLowerCase() === email.toLowerCase()), users })),
      catchError(error => throwError(() => new Error('Server error while checking email.')))
    );
  }

  register(user: User): Observable<User> {
    return this.checkDuplicateEmail(user.email).pipe(
      switchMap(({ isDuplicate, users }) => {
        if (isDuplicate) {
          return throwError(() => new Error('This email is already registered.'));
        }
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (user.role === 'admin' && adminCount > 4) {
          return throwError(() => new Error('Only one admin is allowed.'));
        }
        return this.http.post<User>(this.apiUrl, user);
      }),
      catchError(error => throwError(() => new Error(error.message || 'Registration failed.')))
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          user.activeTime = 0;
          this.sessionStartTime = Date.now();
          localStorage.setItem('user', JSON.stringify(user));
          return user;
        }
        throw new Error('Invalid email or password');
      }),
      catchError(error => throwError(() => new Error('Login failed.')))
    );
  }

  logout(): void {
    if (this.sessionStartTime) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const activeTime = Math.floor((Date.now() - this.sessionStartTime) / 60000);
      user.activeTime = (user.activeTime || 0) + activeTime;
      this.http.put<User>(`${this.apiUrl}/${user.id}`, user).subscribe({
        next: () => console.log('Active time updated on server'),
        error: (err: Error) => console.error('Failed to update active time:', err)
      });
      this.sessionStartTime = null;
    }
    localStorage.removeItem('user');
  }

  verifyAdminPin(pin: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      return pin === user.adminPin;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  getUserRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'user'; // Default to 'user' if role is not set
  }
}