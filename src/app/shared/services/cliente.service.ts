import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cliente, ClienteRequest } from '../models/cliente.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class ClienteService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<BaseResponse<Cliente[]>>(`${this.API}/cliente`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<BaseResponse<Cliente>>(`${this.API}/cliente/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createCliente(body: ClienteRequest): Observable<Cliente> {
    return this.http.post<BaseResponse<Cliente>>(`${this.API}/cliente`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  updateCliente(id: number, body: ClienteRequest): Observable<Cliente> {
    return this.http.put<BaseResponse<Cliente>>(`${this.API}/cliente/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  deleteCliente(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/cliente/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
