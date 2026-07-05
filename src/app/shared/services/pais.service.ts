import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pais } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class PaisService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getPaises(): Observable<Pais[]> {
    return this.http.get<BaseResponse<Pais[]>>(`${this.API}/pais`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getPais(id: number): Observable<Pais> {
    return this.http.get<BaseResponse<Pais>>(`${this.API}/pais/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createPais(body: { nome: string; bandeiraUrl?: string }): Observable<Pais> {
    return this.http.post<BaseResponse<Pais>>(`${this.API}/pais`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  updatePais(id: number, body: { nome: string; bandeiraUrl?: string }): Observable<Pais> {
    return this.http.put<BaseResponse<Pais>>(`${this.API}/pais/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  deletePais(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/pais/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
