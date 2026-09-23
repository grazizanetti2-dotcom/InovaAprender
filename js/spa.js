/* spa.js — orquestra o cabeçalho (tema, menu) e o roteador da SPA. É o único
   arquivo que chama funções dos outros quatro depois de trocar de rota;
   nenhum deles sabe que um roteador existe.

   Ativo só em html/index.html, que é o "shell" da aplicação (tem <div id="app">
   e as <template> de cada rota). projetos.html e cadastro.html continuam
   existindo como arquivos reais, com o mesmo conteúdo dos templates: funcionam
   sozinhas (sem JavaScript, em um link direto ou favorito) e servem de "queda
   suave" caso o roteador não possa assumir a navegação.

   A URL da rota fica só no fragmento (#projetos, #cadastro), nunca no caminho
   do arquivo: em file:// o navegador não permite pushState para outro arquivo
   (a origem de uma página file:// é "nula"), mas trocar só o fragmento da
   MESMA página é sempre permitido — e evita fingir estar em um arquivo que na
   verdade não foi carregado.

   O menu hambúrguer, o dropdown de Projetos, o toast de exemplo e o modal de
   confirmação (em componentes.html) continuam funcionando só com CSS
   (:has() e :target) e não passam por este arquivo. */
window.InovaAprender = window.InovaAprender || {};

(() => {
  // Restaura o tema o quanto antes (depois de armazenamento.js, que sempre
  // carrega primeiro no rodapé de cada página).
  document.querySelectorAll('#tema').forEach((caixa) => {
    caixa.checked = InovaAprender.armazenamento.lerTema();
    caixa.addEventListener('change', () => InovaAprender.armazenamento.salvarTema(caixa.checked));
  });

  const menu = document.getElementById('menu');
  if (menu) {
    document.querySelectorAll('.nav > nav a').forEach((link) => {
      link.addEventListener('click', () => { menu.checked = false; });
    });
  }

  const app = document.getElementById('app');
  if (!app) return; // esta página não é o shell da SPA: os links navegam normalmente

  const rotas = {
    'index.html': 'route-index',
    'projetos.html': 'route-projetos',
    'cadastro.html': 'route-cadastro',
  };
  const arquivoPorChave = { index: 'index.html', projetos: 'projetos.html', cadastro: 'cadastro.html' };

  function lerHash() {
    const partes = location.hash.replace(/^#/, '').split('/').filter(Boolean);
    const arquivo = arquivoPorChave[partes[0]] || 'index.html';
    return { arquivo, ancora: partes[1] || '' };
  }

  function renderizar(arquivo, ancora, focarTitulo) {
    const template = document.getElementById(rotas[arquivo]);
    if (!template) return;

    app.replaceChildren(template.content.cloneNode(true));
    InovaAprender.templates.preencherCards(app); // se a rota clonada tiver #grade-projetos (rota "projetos"), preenche
    InovaAprender.formulario.ativarFormulario(app); // se a rota clonada tiver #form-cadastro (rota "cadastro"), ativa
    InovaAprender.templates.ativarHistorico(app); // se a rota clonada tiver #lista-historico (rota "cadastro"), restaura
    document.title = template.dataset.title;

    document.querySelectorAll('.nav a[href]').forEach((link) => {
      const alvo = new URL(link.getAttribute('href'), location.href).pathname.split('/').pop() || 'index.html';
      if (alvo === arquivo) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (ancora) {
      document.getElementById(ancora)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
      if (focarTitulo) {
        const titulo = app.querySelector('h1');
        titulo?.setAttribute('tabindex', '-1');
        titulo?.focus();
      }
    }
  }

  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;

    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin !== location.origin) return; // link externo (ex.: fontes do Google)

    const arquivo = url.pathname.split('/').pop() || 'index.html';
    if (!(arquivo in rotas)) return; // ex.: componentes.html, mailto:, tel: — navegação normal

    evento.preventDefault();
    let novoHash = '';
    if (arquivo !== 'index.html' || url.hash) {
      const chave = Object.keys(arquivoPorChave).find((k) => arquivoPorChave[k] === arquivo);
      novoHash = '#' + chave + (url.hash ? '/' + url.hash.slice(1) : '');
    }
    if (location.hash !== novoHash) history.pushState(null, '', novoHash || location.pathname);
    renderizar(arquivo, url.hash.slice(1), true);
  });

  window.addEventListener('popstate', () => {
    const { arquivo, ancora } = lerHash();
    renderizar(arquivo, ancora, true);
  });

  // link direto com rota no fragmento (ex.: index.html#projetos/como-doar)
  if (location.hash) {
    const { arquivo, ancora } = lerHash();
    if (arquivo !== 'index.html' || ancora) renderizar(arquivo, ancora, false);
  }
})();
