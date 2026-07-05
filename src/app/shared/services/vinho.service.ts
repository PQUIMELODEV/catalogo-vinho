import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vinho } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VinhoService extends ApiService {
  getVinhos(ativo?: boolean): Observable<Vinho[]> {
    let params = new HttpParams();
    if (ativo !== undefined) params = params.set('ativo', ativo);
    return this.http.get<BaseResponse<Vinho[]>>(`${this.API}/vinho`, { params }).pipe(map(r => r.resultado));
  }
  getVinho(id: string): Observable<Vinho> {
    return this.http.get<BaseResponse<Vinho>>(`${this.API}/vinho/${id}`).pipe(map(r => r.resultado));
  }
  createVinho(body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> {
    return this.http.post<BaseResponse<Vinho>>(`${this.API}/vinho`, body).pipe(map(r => r.resultado));
  }
  updateVinho(id: string, body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> {
    return this.http.put<BaseResponse<Vinho>>(`${this.API}/vinho/${id}`, body).pipe(map(r => r.resultado));
  }
  deleteVinho(id: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/vinho/${id}`);
  }
}
