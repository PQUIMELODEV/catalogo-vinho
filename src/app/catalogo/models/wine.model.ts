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
  /** preço da caixa */
  priceBox: number;
  /** preço da unidade avulsa */
  priceUnit: number;
  /** quantidade de garrafas por caixa */
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
