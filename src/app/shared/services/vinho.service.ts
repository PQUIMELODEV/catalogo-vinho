import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vinho } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class VinhoService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getVinhos(ativo?: boolean): Observable<Vinho[]> {
    let params = new HttpParams();
    if (ativo !== undefined) params = params.set('ativo', ativo);
    return this.http.get<BaseResponse<Vinho[]>>(`${this.API}/vinho`, { params }).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getVinho(id: string): Observable<Vinho> {
    return this.http.get<BaseResponse<Vinho>>(`${this.API}/vinho/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createVinho(body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> {
    return this.http.post<BaseResponse<Vinho>>(`${this.API}/vinho`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  updateVinho(id: string, body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> {
    return this.http.put<BaseResponse<Vinho>>(`${this.API}/vinho/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  deleteVinho(id: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/vinho/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
