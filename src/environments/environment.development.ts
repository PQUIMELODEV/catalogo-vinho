/**
 * Ambiente de DESENVOLVIMENTO — usado pelo `ng serve` (fileReplacements).
 *
 * Usa o mesmo host que serviu o front (localhost no PC, o IP da rede local
 * quando acessado de outro aparelho). No PC usa HTTPS (44396, certificado de
 * dev já confiável); em outro aparelho usa HTTP (54001) para não esbarrar no
 * certificado autoassinado, que não é confiável fora da máquina de dev.
 */
export const environment = {
    production: false,
    apiUrl: window.location.hostname === 'localhost'
        ? `https://${window.location.hostname}:44396/api`
        : `http://${window.location.hostname}:54001/api`,
};
