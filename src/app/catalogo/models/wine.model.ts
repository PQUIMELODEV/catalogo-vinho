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
  quantidadePorCaixa: number;
  valorCaixa?: number;
  paisId: number;
  paisNome?: string;
  tipoVinhoId: number;
  tipoVinhoNome?: string;
  safra: number;
  teorAlcoolico: number;
  volumeMl: number;
  ativo: boolean;
  categorias?: { id: number; nome: string }[];
  criadoEm: string;
}

export interface Estoque {
  vinhoId: string;
  vinhoNome?: string;
  quantidade: number;
  quantidadeMinima: number;
  abaixoMinimo: boolean;
  quantidadePorCaixa?: number;
  criadoEm: string;
}

export interface MovimentacaoEstoque {
  id: string;
  vinhoId: string;
  vinhoNome?: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  quantidadePorCaixa?: number;
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
  pricePromo?: number;
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
  /** Categorias (livres, muitos-para-muitos) às quais o vinho pertence. Base do filtro do catálogo. */
  categorias: { id: number; nome: string }[];
  /** URLs das fotos reais do vinho (VinhoFoto), em ordem. Vazio até haver upload. */
  photos: string[];
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
