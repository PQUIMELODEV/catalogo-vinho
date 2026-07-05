import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VinhoFoto } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FotoService extends ApiService {
  getFotos(vinhoId?: string): Observable<VinhoFoto[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    return this.http.get<BaseResponse<VinhoFoto[]>>(`${this.API}/vinhofoto`, { params }).pipe(map(r => r.resultado));
  }
  createFoto(body: { vinhoId: string; url: string; ordem: number }): Observable<VinhoFoto> {
    return this.http.post<BaseResponse<VinhoFoto>>(`${this.API}/vinhofoto`, body).pipe(map(r => r.resultado));
  }
  updateFoto(id: string, body: { vinhoId: string; url: string; ordem: number }): Observable<VinhoFoto> {
    return this.http.put<BaseResponse<VinhoFoto>>(`${this.API}/vinhofoto/${id}`, body).pipe(map(r => r.resultado));
  }
  deleteFoto(id: string): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.API}/vinhofoto/${id}`);
  }
}
