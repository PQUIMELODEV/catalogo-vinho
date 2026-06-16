import { Wine, WineCategory } from '../models/wine.model';

export const WINE_CATEGORIES: WineCategory[] = ['Tinto', 'Branco', 'Rosé', 'Espumante', 'Sobremesa'];

/** Cores de "líquido" por tipo, usadas no rótulo ilustrado (BottleArt). */
export const VARIETAL_TINT: Record<WineCategory, { base: string; deep: string; glass: string }> = {
  Tinto: { base: '#7c2d3a', deep: '#5a1f2a', glass: '#8e3543' },
  Branco: { base: '#d6c279', deep: '#b9a253', glass: '#e2d28f' },
  'Rosé': { base: '#e09aa6', deep: '#c77684', glass: '#ecb3bd' },
  Espumante: { base: '#e6d59a', deep: '#cdb96f', glass: '#f0e4b6' },
  Sobremesa: { base: '#b5763a', deep: '#915b2a', glass: '#c98e52' },
};

/**
 * Dados de exemplo (mock). No projeto real estes vêm da API ASP.NET Core.
 * Troque WineService.getWines() por uma chamada HttpClient quando integrar.
 */
export const WINES: Wine[] = [
  {
    id: 'w01', name: 'Reserva da Encosta', producer: 'Vinícola Serra Azul',
    region: 'Vale dos Vinhedos, RS', country: 'Brasil', category: 'Tinto',
    grape: 'Cabernet Sauvignon', year: 2019, priceBox: 540, priceUnit: 96, boxQty: 6, stock: 14,
    abv: '13,5%', serve: '16–18 °C', body: 'Encorpado',
    description: 'Um tinto de guarda com taninos firmes e final prolongado. Notas de cassis, pimenta-preta e um toque de baunilha do estágio em barricas de carvalho francês.',
    pairing: ['Carnes vermelhas grelhadas', 'Queijos curados', 'Massas ao ragu'],
    nutrition: { energia: '85 kcal', carboidratos: '2,6 g', acucares: '0,9 g', sodio: '5 mg' }, featured: true,
  },
  {
    id: 'w02', name: 'Pedra Branca', producer: 'Casa Valdez',
    region: 'Mendoza', country: 'Argentina', category: 'Tinto',
    grape: 'Malbec', year: 2021, priceBox: 612, priceUnit: 108, boxQty: 6, stock: 9,
    abv: '14%', serve: '16–18 °C', body: 'Encorpado',
    description: 'Malbec de altitude, intenso e aveludado. Ameixa madura, violeta e cacau, com taninos macios que convidam ao segundo gole.',
    pairing: ['Bife ancho', 'Cordeiro', 'Empanadas'],
    nutrition: { energia: '88 kcal', carboidratos: '2,9 g', acucares: '1,1 g', sodio: '4 mg' }, featured: true,
  },
  {
    id: 'w03', name: 'Vento Sul', producer: 'Quinta do Horizonte',
    region: 'Colchagua', country: 'Chile', category: 'Tinto',
    grape: 'Carménère', year: 2020, priceBox: 474, priceUnit: 84, boxQty: 6, stock: 0,
    abv: '13%', serve: '16–18 °C', body: 'Médio',
    description: 'A uva-assinatura do Chile em sua melhor forma: pimentão maduro, framboesa e especiarias doces, com textura sedosa.',
    pairing: ['Carnes de panela', 'Berinjela grelhada', 'Pimentões recheados'],
    nutrition: { energia: '83 kcal', carboidratos: '2,4 g', acucares: '0,8 g', sodio: '6 mg' }, featured: false,
  },
  {
    id: 'w04', name: 'Folha de Outono', producer: 'Domaine Lebrun',
    region: 'Bordeaux', country: 'França', category: 'Tinto',
    grape: 'Merlot', year: 2018, priceBox: 780, priceUnit: 138, boxQty: 6, stock: 5,
    abv: '13,5%', serve: '17–18 °C', body: 'Encorpado',
    description: 'Corte clássico de Bordeaux com predominância de Merlot. Elegante, com fruta vermelha madura, tabaco e um toque mineral.',
    pairing: ['Magret de pato', 'Cogumelos', 'Queijo brie'],
    nutrition: { energia: '86 kcal', carboidratos: '2,7 g', acucares: '0,7 g', sodio: '5 mg' }, featured: false,
  },
  {
    id: 'w05', name: 'Manhã Clara', producer: 'Vinícola Serra Azul',
    region: 'Campanha, RS', country: 'Brasil', category: 'Branco',
    grape: 'Chardonnay', year: 2022, priceBox: 408, priceUnit: 72, boxQty: 6, stock: 22,
    abv: '12,5%', serve: '8–10 °C', body: 'Médio',
    description: 'Chardonnay fresco com leve passagem por madeira. Pêssego branco, flor de laranjeira e final cremoso e equilibrado.',
    pairing: ['Peixes grelhados', 'Risoto de camarão', 'Aves'],
    nutrition: { energia: '82 kcal', carboidratos: '2,6 g', acucares: '1,0 g', sodio: '3 mg' }, featured: true,
  },
  {
    id: 'w06', name: 'Maré Mansa', producer: 'Quinta do Horizonte',
    region: 'Casablanca', country: 'Chile', category: 'Branco',
    grape: 'Sauvignon Blanc', year: 2023, priceBox: 366, priceUnit: 65, boxQty: 6, stock: 18,
    abv: '12%', serve: '7–9 °C', body: 'Leve',
    description: 'Vibrante e herbáceo, com maracujá, limão-siciliano e notas de capim-limão. Acidez crocante e refrescante.',
    pairing: ['Ostras', 'Saladas cítricas', 'Ceviche'],
    nutrition: { energia: '79 kcal', carboidratos: '2,2 g', acucares: '0,9 g', sodio: '4 mg' }, featured: false,
  },
  {
    id: 'w07', name: 'Jardim de Pedra', producer: 'Cantina Bellavista',
    region: 'Vêneto', country: 'Itália', category: 'Branco',
    grape: 'Pinot Grigio', year: 2022, priceBox: 432, priceUnit: 76, boxQty: 6, stock: 0,
    abv: '12%', serve: '8–10 °C', body: 'Leve',
    description: 'Seco e delicado, com pera, maçã verde e um leve toque de amêndoas. Perfeito como aperitivo.',
    pairing: ['Antepastos', 'Frutos do mar leves', 'Queijos frescos'],
    nutrition: { energia: '80 kcal', carboidratos: '2,3 g', acucares: '0,8 g', sodio: '3 mg' }, featured: false,
  },
  {
    id: 'w08', name: 'Pôr do Sol', producer: 'Casa Valdez',
    region: 'Provença', country: 'França', category: 'Rosé',
    grape: 'Grenache', year: 2023, priceBox: 450, priceUnit: 80, boxQty: 6, stock: 11,
    abv: '12,5%', serve: '8–10 °C', body: 'Leve',
    description: 'Rosé pálido de estilo provençal. Morango silvestre, melancia e flores brancas, seco e elegante.',
    pairing: ['Saladas', 'Comida tailandesa', 'Tapas'],
    nutrition: { energia: '81 kcal', carboidratos: '2,5 g', acucares: '1,2 g', sodio: '4 mg' }, featured: true,
  },
  {
    id: 'w09', name: 'Flor de Sal', producer: 'Vinícola Serra Azul',
    region: 'Serra Gaúcha, RS', country: 'Brasil', category: 'Rosé',
    grape: 'Pinot Noir', year: 2023, priceBox: 396, priceUnit: 70, boxQty: 6, stock: 16,
    abv: '12%', serve: '8–10 °C', body: 'Leve',
    description: 'Rosé brasileiro fresco e frutado, com cereja, romã e um final levemente cítrico. Ótimo para o dia a dia.',
    pairing: ['Pizza margherita', 'Sushi', 'Comida leve'],
    nutrition: { energia: '80 kcal', carboidratos: '2,4 g', acucares: '1,1 g', sodio: '4 mg' }, featured: false,
  },
  {
    id: 'w10', name: 'Brilho da Meia-Noite', producer: 'Cantina Bellavista',
    region: 'Franciacorta', country: 'Itália', category: 'Espumante',
    grape: 'Chardonnay / Pinot Noir', year: 2020, priceBox: 720, priceUnit: 128, boxQty: 6, stock: 8,
    abv: '12,5%', serve: '6–8 °C', body: 'Médio',
    description: 'Método tradicional com 24 meses de maturação. Perlage fina e persistente, com brioche, maçã e avelã.',
    pairing: ['Aperitivos', 'Frutos do mar', 'Comemorações'],
    nutrition: { energia: '84 kcal', carboidratos: '3,0 g', acucares: '1,4 g', sodio: '5 mg' }, featured: true,
  },
  {
    id: 'w11', name: 'Borbulhas de Verão', producer: 'Vinícola Serra Azul',
    region: 'Pinto Bandeira, RS', country: 'Brasil', category: 'Espumante',
    grape: 'Moscatel', year: 2023, priceBox: 348, priceUnit: 62, boxQty: 6, stock: 25,
    abv: '8%', serve: '5–7 °C', body: 'Leve',
    description: 'Espumante moscatel doce e aromático, com flor de laranjeira, mel e uva fresca. Leve e festivo.',
    pairing: ['Sobremesas', 'Frutas', 'Panetone'],
    nutrition: { energia: '94 kcal', carboidratos: '6,8 g', acucares: '6,2 g', sodio: '4 mg' }, featured: false,
  },
  {
    id: 'w12', name: 'Âmbar Tardio', producer: 'Domaine Lebrun',
    region: 'Sauternes', country: 'França', category: 'Sobremesa',
    grape: 'Sémillon', year: 2017, priceBox: 960, priceUnit: 170, boxQty: 6, stock: 4,
    abv: '13,5%', serve: '8–10 °C', body: 'Encorpado',
    description: 'Vinho de colheita tardia, untuoso e complexo. Damasco em calda, mel, açafrão e um final infinito.',
    pairing: ['Foie gras', 'Queijos azuis', 'Tortas de frutas'],
    nutrition: { energia: '160 kcal', carboidratos: '12,5 g', acucares: '11,8 g', sodio: '6 mg' }, featured: false,
  },
];
