// Tipos do catálogo alinhados com o DER

export interface Pais {
  id: number;
  nome: string;
  bandeiraUrl?: string;
  criadoEm: string;
}

export interface TipoVinho {
  id: number;
  nome: string; // Tinto | Branco | Rose | Espumante
  criadoEm: string;
}

export interface Vinho {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  precoPromocional?: number;
  paisId: number;
  paisNome?: string;
  tipoVinhoId: number;
  tipoVinhoNome?: string;
  safra: number;
  teorAlcoolico: number;
  volumeMl: number;
  ativo: boolean;
  criadoEm: string;
}

export interface Estoque {
  vinhoId: string;
  vinhoNome?: string;
  quantidade: number;
  quantidadeMinima: number;
  abaixoMinimo: boolean;
  criadoEm: string;
}

export interface MovimentacaoEstoque {
  id: string;
  vinhoId: string;
  vinhoNome?: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  criadoEm: string;
}

export interface VinhoFoto {
  id: string;
  vinhoId: string;
  url: string;
  ordem: number;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
}

export interface VinhoCategoria {
  vinhoId: string;
  vinhoNome?: string;
  categoriaId: number;
  categoriaNome?: string;
}

// Tipos legados — usados pelo catálogo público (campos em inglês)
export type WineCategory = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante' | 'Sobremesa';

export interface Wine {
  id: string;
  name: string;
  producer: string;
  region: string;
  country: string;
  category: WineCategory;
  grape: string;
  year: number;
  priceBox: number;
  priceUnit: number;
  boxQty: number;
  stock: number;
  abv: string;
  serve: string;
  body: string;
  description: string;
  pairing: string[];
  nutrition: {
    energia: string;
    carboidratos: string;
    acucares: string;
    sodio: string;
  };
  featured: boolean;
}

export type PurchaseKind = 'unit' | 'box';

export interface CartItem {
  id: string;
  kind: PurchaseKind;
  qty: number;
}

export interface CartLine extends CartItem {
  wine: Wine;
  unitPrice: number;
  lineTotal: number;
}
