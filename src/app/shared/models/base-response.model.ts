export interface BaseResponse<T = unknown> {
  codigo: string;
  status: boolean;
  enumTipoRetorno: EnumTipoRetornoApi;
  mensagem: string;
  resultado: T;
  resultadoMobile: T;
  tree: ResultadoTree | null;
  lista: ListaTabelaDeDados | null;
  permissao: Permissao[] | null;
  erros: string[] | null;
  converterDatetime: boolean;
}

export enum EnumTipoRetornoApi {
  Sucesso = 0,
  Erro = 1,
  Validacao = 2,
  NivelAcesso = 3,
}

export interface ResultadoTree {
  arvore: TreeNode[];
  selecionados: TreeNode[];
  arvoreVestigios: TreeNode[];
}

export interface TreeNode {
  key: string;
  label: string;
  data: unknown;
  icon: string;
  type: string;
  leaf: boolean;
  children: TreeNode[];
}

export interface ListaTabelaDeDados {
  indexChave: IndexChave | null;
  cols: Column[];
  values: Values;
}

export interface Column {
  field: string;
  header: string;
}

export interface Values {
  value: Record<string, unknown>[];
}

export interface IndexChave {
  index: number[];
  chave: Record<number, string>;
}

export interface Permissao {
  path: string;
  selecionar: boolean;
  inserir: boolean;
  editar: boolean;
  remover: boolean;
  funcionalidades: PermissaoEspecial[];
}

export interface PermissaoEspecial {
  funcionalidade: string;
  podeRealizar: boolean;
}
