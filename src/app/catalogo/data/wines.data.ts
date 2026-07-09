import { WineCategory } from '../models/wine.model';

/** Cores de "líquido" por tipo, usadas no rótulo ilustrado (BottleArt). */
export const VARIETAL_TINT: Record<WineCategory, { base: string; deep: string; glass: string }> = {
  Tinto: { base: '#7c2d3a', deep: '#5a1f2a', glass: '#8e3543' },
  Branco: { base: '#d6c279', deep: '#b9a253', glass: '#e2d28f' },
  'Rosé': { base: '#e09aa6', deep: '#c77684', glass: '#ecb3bd' },
  Espumante: { base: '#e6d59a', deep: '#cdb96f', glass: '#f0e4b6' },
  Sobremesa: { base: '#b5763a', deep: '#915b2a', glass: '#c98e52' },
};
