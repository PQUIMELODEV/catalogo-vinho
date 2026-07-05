import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Categoria } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getCategorias(ativo?: boolean): Observable<Categoria[]> {
    let params = new HttpParams();
    if (ativo !== undefined) params = params.set('ativo', ativo);
    return this.http.get<BaseResponse<Categoria[]>>(`${this.API}/categoria`, { params }).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<BaseResponse<Categoria>>(`${this.API}/categoria/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createCategoria(body: { nome: string; slug: string; ativo: boolean }): Observable<Categoria> {
    return this.http.post<BaseResponse<Categoria>>(`${this.API}/categoria`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  updateCategoria(id: number, body: { nome: string; slug: string; ativo: boolean }): Observable<Categoria> {
    return this.http.put<BaseResponse<Categoria>>(`${this.API}/categoria/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  deleteCategoria(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/categoria/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
