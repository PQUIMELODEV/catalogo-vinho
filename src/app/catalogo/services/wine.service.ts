import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Vinho, VinhoFoto, Wine, WineCategory } from '../models/wine.model';
import { VinhoService } from '../../shared/services/vinho.service';
import { EstoqueService } from '../../shared/services/estoque.service';
import { FotoService } from '../../shared/services/foto.service';

/**
 * Fonte de dados do catálogo público.
 * Busca os vinhos ativos (visíveis no catálogo), o estoque e as fotos reais da API.
 */
@Injectable({ providedIn: 'root' })
export class WineService {
  private readonly vinhoService = inject(VinhoService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly fotoService = inject(FotoService);

  private readonly wines$: Observable<Wine[]> = forkJoin({
    vinhos: this.vinhoService.getVinhos(true),
    estoques: this.estoqueService.getEstoques(),
    fotos: this.fotoService.getFotos(),
  }).pipe(
    map(({ vinhos, estoques, fotos }) => {
      const quantidadePorVinho = new Map(estoques.map((e) => [e.vinhoId, e.quantidade]));
      const fotosPorVinho = new Map<string, VinhoFoto[]>();
      for (const foto of fotos) {
        const lista = fotosPorVinho.get(foto.vinhoId) ?? [];
        lista.push(foto);
        fotosPorVinho.set(foto.vinhoId, lista);
      }
      return vinhos.map((v) => this.toWine(
        v,
        quantidadePorVinho.get(v.id) ?? 0,
        (fotosPorVinho.get(v.id) ?? []).slice().sort((a, b) => a.ordem - b.ordem).map((f) => f.url),
      ));
    }),
    shareReplay(1),
  );

  getWines(): Observable<Wine[]> {
    return this.wines$;
  }

  getCategories(): Observable<WineCategory[]> {
    return this.wines$.pipe(map((wines) => Array.from(new Set(wines.map((w) => w.category)))));
  }

  getById(id: string): Observable<Wine | undefined> {
    return this.wines$.pipe(map((wines) => wines.find((w) => w.id === id)));
  }

  /** Converte o Vinho real (back-end) para o modelo Wine usado hoje no catálogo. */
  private toWine(v: Vinho, quantidadeEmEstoque: number, photos: string[]): Wine {
    return {
      id: v.id,
      name: v.nome,
      // Produtor, região e uva ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
      producer: '',
      region: '',
      country: v.paisNome ?? '',
      category: this.normalizeCategory(v.tipoVinhoNome),
      grape: '',
      year: v.safra,
      // Preço/quantidade de caixa ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
      priceBox: 0,
      priceUnit: v.preco,
      boxQty: 0,
      stock: quantidadeEmEstoque,
      abv: `${v.teorAlcoolico}%`,
      // Corpo e temperatura de serviço ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
      serve: '',
      body: '',
      description: v.descricao ?? '',
      // Harmonização e tabela nutricional ainda não existem no back-end (Vinho). Reative quando houver esse dado real.
      pairing: [],
      nutrition: { energia: '', carboidratos: '', acucares: '', sodio: '' },
      // "Destaque" ainda não existe no back-end (Vinho). Reative quando houver esse dado real.
      featured: false,
      photos,
    };
  }

  /** O back-end guarda o tipo sem acento (ex.: "Rose"); normaliza para o rótulo usado na UI. */
  private normalizeCategory(nome?: string): WineCategory {
    switch ((nome ?? '').trim().toLowerCase()) {
      case 'tinto': return 'Tinto';
      case 'branco': return 'Branco';
      case 'rose':
      case 'rosé': return 'Rosé';
      case 'espumante': return 'Espumante';
      case 'sobremesa': return 'Sobremesa';
      default: return 'Tinto';
    }
  }
}
