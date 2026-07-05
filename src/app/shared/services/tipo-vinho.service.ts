import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TipoVinho } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class TipoVinhoService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getTiposVinho(): Observable<TipoVinho[]> {
    return this.http.get<BaseResponse<TipoVinho[]>>(`${this.API}/tipovinho`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getTipoVinho(id: number): Observable<TipoVinho> {
    return this.http.get<BaseResponse<TipoVinho>>(`${this.API}/tipovinho/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createTipoVinho(body: { nome: string }): Observable<TipoVinho> {
    return this.http.post<BaseResponse<TipoVinho>>(`${this.API}/tipovinho`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  updateTipoVinho(id: number, body: { nome: string }): Observable<TipoVinho> {
    return this.http.put<BaseResponse<TipoVinho>>(`${this.API}/tipovinho/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  deleteTipoVinho(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/tipovinho/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
