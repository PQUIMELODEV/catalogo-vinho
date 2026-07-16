import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CheckoutItem, Pedido, PedidoRequest } from '../models/pedido.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class PedidoService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<BaseResponse<Pedido[]>>(`${this.API}/pedido`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<BaseResponse<Pedido>>(`${this.API}/pedido/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }
  createPedido(body: PedidoRequest): Observable<Pedido> {
    return this.http.post<BaseResponse<Pedido>>(`${this.API}/pedido`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  updatePedido(id: number, body: PedidoRequest): Observable<Pedido> {
    return this.http.put<BaseResponse<Pedido>>(`${this.API}/pedido/${id}`, body).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  /** Finaliza o pedido a partir do carrinho do catálogo, usando o cliente vinculado ao usuário logado. */
  checkout(itens: CheckoutItem[]): Observable<Pedido> {
    return this.http.post<BaseResponse<Pedido>>(`${this.API}/pedido/checkout`, { itens }).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
          throw new Error(r.mensagem);
        }
        return r.resultado;
      })
    );
  }
  deletePedido(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/pedido/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
