import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { BaseResponse, EnumTipoRetornoApi } from '../models/base-response.model';

enum posicaoMensagem {
  topRight = 'top-right',
  topLeft = 'top-left',
  bottomRight = 'bottom-right',
  bottomLeft = 'bottom-left',
  topCenter = 'top-center',
  bottomCenter = 'bottom-center',
  center = 'center'
}

enum severity {
  sucesso = 'success',
  erro = 'error',
  info = 'info',
  aviso = 'warning'
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private messageService: MessageService) {}

  abrirMensagemResponse<T>(baseResponse: BaseResponse<T>, tempo: number = 3): void {
    if (baseResponse.status) {
      this.openSuccess(baseResponse.mensagem, undefined, undefined, undefined, tempo);
      return;
    }

    if (baseResponse.codigo === '400' && baseResponse.erros?.length) {
      baseResponse.erros.forEach(e => this.openError(e));
      return;
    }

    switch (baseResponse.enumTipoRetorno) {
      case EnumTipoRetornoApi.Sucesso:
        this.openSuccess(baseResponse.mensagem, undefined, undefined, undefined, tempo);
        break;
      case EnumTipoRetornoApi.Validacao:
      case EnumTipoRetornoApi.NivelAcesso:
        this.openInfo(baseResponse.mensagem, undefined, undefined, undefined, tempo);
        break;
      default:
        this.openError(baseResponse.mensagem, undefined, undefined, undefined, tempo);
    }
  }

  openSuccess(
    mensagem: string,
    titulo: string = 'Sucesso',
    posicao: posicaoMensagem = posicaoMensagem.bottomCenter,
    gravidade: severity = severity.sucesso,
    tempo: number = 3
  ): void {
    this.messageService.add({ severity: gravidade, summary: titulo, detail: mensagem, life: tempo * 1000 });
  }

  openError(
    mensagem: string,
    titulo: string = 'Erro',
    posicao: posicaoMensagem = posicaoMensagem.bottomCenter,
    gravidade: severity = severity.erro,
    tempo: number = 3
  ): void {
    this.messageService.add({ severity: gravidade, summary: titulo, detail: mensagem, life: tempo * 1000 });
  }

  openInfo(
    mensagem: string,
    titulo: string = 'Atenção',
    posicao: posicaoMensagem = posicaoMensagem.bottomCenter,
    gravidade: severity = severity.info,
    tempo: number = 3
  ): void {
    this.messageService.add({ severity: gravidade, summary: titulo, detail: mensagem, life: tempo * 1000 });
  }

  openCatchError(
    e: HttpErrorResponse,
    titulo: string = 'Erro',
    posicao: posicaoMensagem = posicaoMensagem.bottomCenter,
    gravidade: severity = severity.erro
  ): void {
    if (!e.error?.erros) {
      this.messageService.add({ severity: gravidade, summary: titulo, detail: e.message });
      return;
    }

    (e.error.erros as string[]).forEach(erro =>
      this.messageService.add({ severity: gravidade, summary: titulo, detail: erro })
    );
  }

  openMultiplosErros(
    erros: string[],
    titulo: string = 'Erro',
    gravidade: severity = severity.erro,
    tempo: number = 3
  ): void {
    erros.forEach(erro =>
      this.messageService.add({ severity: gravidade, summary: titulo, detail: erro, life: tempo * 1000 })
    );
  }
}
