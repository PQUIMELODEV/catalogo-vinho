import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VinhoFoto } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class FotoService extends ApiService {

  constructor(http: HttpClient, private snackbar: SnackbarService) {
    super(http);
  }

  getFotos(vinhoId?: string): Observable<VinhoFoto[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    return this.http.get<BaseResponse<VinhoFoto[]>>(`${this.API}/vinhofoto`, { params }).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }

  uploadFoto(vinhoId: string, arquivo: File): Observable<VinhoFoto> {
    const formData = new FormData();
    formData.append('vinhoId', vinhoId);
    formData.append('arquivo', arquivo);
    return this.http.post<BaseResponse<VinhoFoto>>(`${this.API}/vinhofoto/upload`, formData).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r.resultado;
      })
    );
  }

  atualizarOrdem(id: string, ordem: number): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(`${this.API}/vinhofoto/${id}/ordem`, { ordem }).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }

  deleteFoto(id: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/vinhofoto/${id}`).pipe(
      map(r => {
        if (!r.status) {
          this.snackbar.abrirMensagemResponse(r);
        }
        return r;
      })
    );
  }
}
