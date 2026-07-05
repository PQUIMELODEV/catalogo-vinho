import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MovimentacaoEstoque } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MovimentacaoService extends ApiService {
  getMovimentacoes(vinhoId?: string): Observable<MovimentacaoEstoque[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    return this.http.get<BaseResponse<MovimentacaoEstoque[]>>(`${this.API}/movimentacaoestoque`, { params }).pipe(map(r => r.resultado));
  }
  createMovimentacao(body: { vinhoId: string; tipo: string; quantidade: number; motivo: string }): Observable<MovimentacaoEstoque> {
    return this.http.post<BaseResponse<MovimentacaoEstoque>>(`${this.API}/movimentacaoestoque`, body).pipe(map(r => r.resultado));
  }
  deleteMovimentacao(id: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/movimentacaoestoque/${id}`);
  }
}
