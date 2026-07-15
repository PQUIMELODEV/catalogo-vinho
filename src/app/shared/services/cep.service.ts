import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly BASE = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscar(cep: string): Observable<ViaCepResponse | null> {
    const cepLimpo = (cep || '').replace(/\D/g, '');
    if (cepLimpo.length !== 8) return of(null);

    return this.http.get<ViaCepResponse>(`${this.BASE}/${cepLimpo}/json/`).pipe(
      map(r => (r.erro ? null : r)),
      catchError(() => of(null))
    );
  }
}
