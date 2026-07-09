import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario, UsuarioRequest } from '../models/usuario.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<BaseResponse<Usuario[]>>(`${this.API}/usuario`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<BaseResponse<Usuario>>(`${this.API}/usuario/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createUsuario(body: UsuarioRequest): Observable<Usuario> {
    return this.http.post<BaseResponse<Usuario>>(`${this.API}/usuario`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  updateUsuario(id: number, body: UsuarioRequest): Observable<Usuario> {
    return this.http.put<BaseResponse<Usuario>>(`${this.API}/usuario/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  deleteUsuario(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/usuario/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
