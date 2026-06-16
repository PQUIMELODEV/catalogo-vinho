import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Wine, WineCategory } from '../models/wine.model';
import { WINES, WINE_CATEGORIES } from '../data/wines.data';

/**
 * Fonte de dados do catálogo.
 * Hoje devolve dados mockados; para integrar com a API ASP.NET Core,
 * injete o HttpClient e troque os `of(...)` por `http.get<Wine[]>('/api/wines')`.
 */
@Injectable({ providedIn: 'root' })
export class WineService {
  // constructor(private http: HttpClient) {}

  getWines(): Observable<Wine[]> {
    // return this.http.get<Wine[]>(`${environment.apiUrl}/wines`);
    return of(WINES);
  }

  getCategories(): Observable<WineCategory[]> {
    return of(WINE_CATEGORIES);
  }

  getById(id: string): Observable<Wine | undefined> {
    return of(WINES.find((w) => w.id === id));
  }
}
