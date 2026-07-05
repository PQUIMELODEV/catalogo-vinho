import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TipoVinho } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TipoVinhoService extends ApiService {
  getTiposVinho(): Observable<TipoVinho[]> {
    return this.http.get<BaseResponse<TipoVinho[]>>(`${this.API}/tipovinho`).pipe(map(r => r.resultado));
  }
  getTipoVinho(id: number): Observable<TipoVinho> {
    return this.http.get<BaseResponse<TipoVinho>>(`${this.API}/tipovinho/${id}`).pipe(map(r => r.resultado));
  }
  createTipoVinho(body: { nome: string }): Observable<TipoVinho> {
    return this.http.post<BaseResponse<TipoVinho>>(`${this.API}/tipovinho`, body).pipe(map(r => r.resultado));
  }
  updateTipoVinho(id: number, body: { nome: string }): Observable<TipoVinho> {
    return this.http.put<BaseResponse<TipoVinho>>(`${this.API}/tipovinho/${id}`, body).pipe(map(r => r.resultado));
  }
  deleteTipoVinho(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/tipovinho/${id}`);
  }
}
