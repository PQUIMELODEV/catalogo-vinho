import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Pais, TipoVinho, Vinho, Estoque,
  MovimentacaoEstoque, VinhoFoto, Categoria, VinhoCategoria
} from '../../catalogo/models/wine.model';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Países
  getPaises(): Observable<Pais[]> { return this.http.get<Pais[]>(`${API}/pais`); }
  getPais(id: number): Observable<Pais> { return this.http.get<Pais>(`${API}/pais/${id}`); }
  createPais(body: { nome: string; bandeiraUrl?: string }): Observable<Pais> { return this.http.post<Pais>(`${API}/pais`, body); }
  updatePais(id: number, body: { nome: string; bandeiraUrl?: string }): Observable<Pais> { return this.http.put<Pais>(`${API}/pais/${id}`, body); }
  deletePais(id: number): Observable<void> { return this.http.delete<void>(`${API}/pais/${id}`); }

  // Tipos de Vinho
  getTiposVinho(): Observable<TipoVinho[]> { return this.http.get<TipoVinho[]>(`${API}/tipovinho`); }
  getTipoVinho(id: number): Observable<TipoVinho> { return this.http.get<TipoVinho>(`${API}/tipovinho/${id}`); }
  createTipoVinho(body: { nome: string }): Observable<TipoVinho> { return this.http.post<TipoVinho>(`${API}/tipovinho`, body); }
  updateTipoVinho(id: number, body: { nome: string }): Observable<TipoVinho> { return this.http.put<TipoVinho>(`${API}/tipovinho/${id}`, body); }
  deleteTipoVinho(id: number): Observable<void> { return this.http.delete<void>(`${API}/tipovinho/${id}`); }

  // Vinhos
  getVinhos(ativo?: boolean): Observable<Vinho[]> {
    let params = new HttpParams();
    if (ativo !== undefined) params = params.set('ativo', ativo);
    return this.http.get<Vinho[]>(`${API}/vinho`, { params });
  }
  getVinho(id: string): Observable<Vinho> { return this.http.get<Vinho>(`${API}/vinho/${id}`); }
  createVinho(body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> { return this.http.post<Vinho>(`${API}/vinho`, body); }
  updateVinho(id: string, body: Omit<Vinho, 'id' | 'criadoEm' | 'paisNome' | 'tipoVinhoNome'>): Observable<Vinho> { return this.http.put<Vinho>(`${API}/vinho/${id}`, body); }
  deleteVinho(id: string): Observable<void> { return this.http.delete<void>(`${API}/vinho/${id}`); }

  // Estoque
  getEstoques(): Observable<Estoque[]> { return this.http.get<Estoque[]>(`${API}/estoque`); }
  getEstoque(vinhoId: string): Observable<Estoque> { return this.http.get<Estoque>(`${API}/estoque/${vinhoId}`); }
  getAlertasEstoque(): Observable<Estoque[]> { return this.http.get<Estoque[]>(`${API}/estoque/alertas`); }
  updateEstoque(vinhoId: string, body: { vinhoId: string; quantidade: number; quantidadeMinima: number }): Observable<Estoque> { return this.http.put<Estoque>(`${API}/estoque/${vinhoId}`, body); }

  // Movimentações
  getMovimentacoes(vinhoId?: string): Observable<MovimentacaoEstoque[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    return this.http.get<MovimentacaoEstoque[]>(`${API}/movimentacaoestoque`, { params });
  }
  createMovimentacao(body: { vinhoId: string; tipo: string; quantidade: number; motivo: string }): Observable<MovimentacaoEstoque> {
    return this.http.post<MovimentacaoEstoque>(`${API}/movimentacaoestoque`, body);
  }
  deleteMovimentacao(id: string): Observable<void> { return this.http.delete<void>(`${API}/movimentacaoestoque/${id}`); }

  // Fotos
  getFotos(vinhoId?: string): Observable<VinhoFoto[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    return this.http.get<VinhoFoto[]>(`${API}/vinhofoto`, { params });
  }
  createFoto(body: { vinhoId: string; url: string; ordem: number }): Observable<VinhoFoto> { return this.http.post<VinhoFoto>(`${API}/vinhofoto`, body); }
  updateFoto(id: string, body: { vinhoId: string; url: string; ordem: number }): Observable<VinhoFoto> { return this.http.put<VinhoFoto>(`${API}/vinhofoto/${id}`, body); }
  deleteFoto(id: string): Observable<void> { return this.http.delete<void>(`${API}/vinhofoto/${id}`); }

  // Categorias
  getCategorias(ativo?: boolean): Observable<Categoria[]> {
    let params = new HttpParams();
    if (ativo !== undefined) params = params.set('ativo', ativo);
    return this.http.get<Categoria[]>(`${API}/categoria`, { params });
  }
  createCategoria(body: { nome: string; slug: string; ativo: boolean }): Observable<Categoria> { return this.http.post<Categoria>(`${API}/categoria`, body); }
  updateCategoria(id: number, body: { nome: string; slug: string; ativo: boolean }): Observable<Categoria> { return this.http.put<Categoria>(`${API}/categoria/${id}`, body); }
  deleteCategoria(id: number): Observable<void> { return this.http.delete<void>(`${API}/categoria/${id}`); }

  // VinhoCategorias
  getVinhoCategorias(vinhoId?: string, categoriaId?: number): Observable<VinhoCategoria[]> {
    let params = new HttpParams();
    if (vinhoId) params = params.set('vinhoId', vinhoId);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    return this.http.get<VinhoCategoria[]>(`${API}/vinhocategoria`, { params });
  }
  createVinhoCategoria(body: { vinhoId: string; categoriaId: number }): Observable<VinhoCategoria> { return this.http.post<VinhoCategoria>(`${API}/vinhocategoria`, body); }
  deleteVinhoCategoria(vinhoId: string, categoriaId: number): Observable<void> {
    let params = new HttpParams().set('vinhoId', vinhoId).set('categoriaId', categoriaId);
    return this.http.delete<void>(`${API}/vinhocategoria`, { params });
  }
}
