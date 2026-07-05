import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VinhoCategoria } from '../../catalogo/models/wine.model';
import { BaseResponse } from '../models/base-response.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VinhoCategoriaService extends ApiService {
  getVinhoCategorias(vinhoId?: string, categoriaId?: number): Observable<VinhoCategoria[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    return this.http.get<BaseResponse<VinhoCategoria[]>>(`${this.API}/vinhocategoria`, { params }).pipe(map(r => r.resultado));
  }
  createVinhoCategoria(body: { vinhoId: string; categoriaId: number }): Observable<VinhoCategoria> {
    return this.http.post<BaseResponse<VinhoCategoria>>(`${this.API}/vinhocategoria`, body).pipe(map(r => r.resultado));
  }
  deleteVinhoCategoria(vinhoId: string, categoriaId: number): Observable<BaseResponse> {
    const params = new HttpParams().set('vinhoId', vinhoId).set('categoriaId', categoriaId);
    return this.http.delete<BaseResponse>(`${this.API}/vinhocategoria`, { params });
  }
}
