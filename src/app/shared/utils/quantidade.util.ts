/** Utilidades para exibir/converter quantidades entre unidades e caixas. */

/** Converte um número de caixas para unidades. */
export function caixasParaUnidades(caixas: number, porCaixa: number): number {
    if (!porCaixa || porCaixa <= 0) return caixas;
    return caixas * porCaixa;
}

/**
 * Retorna um rótulo curto com a quebra em caixas para uma quantidade em unidades.
 * Ex.: 126 un com 12/cx -> "10 cx + 6 un". Retorna '' quando não há caixa completa
 * ou quando o vinho não é vendido em caixa (porCaixa <= 0).
 */
export function quebraEmCaixasLabel(unidades: number, porCaixa: number): string {
    if (!porCaixa || porCaixa <= 0) return '';
    const caixas = Math.floor(unidades / porCaixa);
    if (caixas <= 0) return '';
    const resto = unidades % porCaixa;
    return resto === 0 ? `${caixas} cx` : `${caixas} cx + ${resto} un`;
}
