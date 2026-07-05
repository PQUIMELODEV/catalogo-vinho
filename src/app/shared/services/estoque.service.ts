import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Estoque } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class EstoqueService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getEstoques(): Observable<Estoque[]> {
    return this.http.get<BaseResponse<Estoque[]>>(`${this.API}/estoque`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getEstoque(vinhoId: string): Observable<Estoque> {
    return this.http.get<BaseResponse<Estoque>>(`${this.API}/estoque/${vinhoId}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getAlertasEstoque(): Observable<Estoque[]> {
    return this.http.get<BaseResponse<Estoque[]>>(`${this.API}/estoque/alertas`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  updateEstoque(vinhoId: string, body: { vinhoId: string; quantidade: number; quantidadeMinima: number }): Observable<Estoque> {
    return this.http.put<BaseResponse<Estoque>>(`${this.API}/estoque/${vinhoId}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
}
