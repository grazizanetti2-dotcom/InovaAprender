/* armazenamento.js — única camada que toca o localStorage no projeto.
   Não manipula o DOM e não sabe o que é um formulário, um card ou uma rota:
   só guarda e devolve dados. Os outros arquivos pedem dados por aqui — nenhum
   deles chama localStorage diretamente. */
window.InovaAprender = window.InovaAprender || {};

InovaAprender.armazenamento = (() => {
  const CHAVE_TEMA = 'inovaaprender:tema';
  const CHAVE_HISTORICO = 'inovaaprender:cadastros';

  function lerTema() {
    return localStorage.getItem(CHAVE_TEMA) === 'escuro';
  }
  function salvarTema(escuro) {
    try {
      localStorage.setItem(CHAVE_TEMA, escuro ? 'escuro' : 'claro');
    } catch {
      // localStorage bloqueado ou cheio: o tema muda na tela mesmo assim,
      // só não persiste para a próxima visita.
    }
  }

  function lerHistorico() {
    try {
      const bruto = localStorage.getItem(CHAVE_HISTORICO); // string salva (ou null)
      return bruto ? JSON.parse(bruto) : []; // string -> array de objetos
    } catch {
      return []; // localStorage indisponível ou dado corrompido: segue com lista vazia
    }
  }
  function salvarHistorico(lista) {
    try {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista)); // array de objetos -> string
    } catch {
      // localStorage bloqueado ou cheio: o cadastro não fica registrado no
      // histórico deste navegador, mas o restante do envio (o alerta de
      // sucesso, a limpeza do formulário) continua funcionando normalmente.
    }
  }
  function limparHistorico() {
    try {
      localStorage.removeItem(CHAVE_HISTORICO);
    } catch {
      // idem: ignora silenciosamente se o navegador recusar o acesso
    }
  }

  return { lerTema, salvarTema, lerHistorico, salvarHistorico, limparHistorico };
})();
