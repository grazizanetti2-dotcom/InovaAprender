/* templates.js — transforma dados em elementos visíveis, clonando <template>
   (os 6 cards de projetos e os itens do histórico de cadastros).
   Depende de InovaAprender.armazenamento (para ler o histórico) e de
   InovaAprender.integracoes (para formatar datas) — só pela função pública de
   cada um; nunca lê localStorage nem configura o Day.js por conta própria. */
window.InovaAprender = window.InovaAprender || {};

InovaAprender.templates = (() => {
  const projetosData = [
    { tag: 'Digital básico', titulo: 'Primeiros Passos Digitais', descricao: 'Oficinas para aprender a usar computador, internet e e-mail no dia a dia dos estudos.' },
    { tag: 'Reforço', titulo: 'Reforço Digital', descricao: 'Aulas online de reforço em matemática e português, conduzidas por voluntários.' },
    { tag: 'Inclusão', titulo: 'Conecta Escola', descricao: 'Doação e manutenção de computadores e internet para escolas da rede pública.' },
    { tag: 'Formação', titulo: 'Professor Inovador', descricao: 'Capacitação de educadores em metodologias ativas e ferramentas digitais.' },
    { tag: 'Leitura', titulo: 'Biblioteca Viva', descricao: 'Espaços de leitura e contação de histórias em comunidades e bibliotecas populares.' },
    { tag: 'Carreira', titulo: 'Futuro em Ação', descricao: 'Mentoria e orientação profissional para jovens em fase de escolha de carreira.' },
  ];

  function preencherCards(escopo) {
    const grade = escopo.querySelector('#grade-projetos');
    const molde = document.getElementById('tpl-card-projeto');
    if (!grade || !molde) return; // esta página/rota não tem a grade de projetos

    const cards = projetosData.map((projeto) => {
      const card = molde.content.cloneNode(true);
      card.querySelector('.tag').textContent = projeto.tag;
      card.querySelector('h3').textContent = projeto.titulo;
      card.querySelector('p').textContent = projeto.descricao;
      return card;
    });
    grade.replaceChildren(...cards);
  }

  function renderizarHistorico(escopo) {
    const lista = escopo.querySelector('#lista-historico');
    const molde = document.getElementById('tpl-item-historico');
    const vazio = escopo.querySelector('#historico-vazio');
    if (!lista || !molde) return; // esta página/rota não tem o painel de histórico

    const registros = InovaAprender.armazenamento.lerHistorico();
    if (vazio) vazio.hidden = registros.length > 0;

    const itens = registros
      .slice()
      .reverse() // mais recente primeiro
      .map((registro) => {
        const item = molde.content.cloneNode(true);
        item.querySelector('.badge').textContent = registro.tipo;
        item.querySelector('strong').textContent = registro.nome;
        const tempo = item.querySelector('time');
        tempo.dateTime = registro.data;
        tempo.textContent = InovaAprender.integracoes.formatarData(registro.data);
        return item;
      });
    lista.replaceChildren(...itens);
  }

  function ativarHistorico(escopo) {
    renderizarHistorico(escopo);
    const botao = escopo.querySelector('#limpar-historico');
    botao?.addEventListener('click', () => {
      InovaAprender.armazenamento.limparHistorico();
      renderizarHistorico(escopo);
    });
  }

  return { preencherCards, renderizarHistorico, ativarHistorico };
})();

InovaAprender.templates.preencherCards(document); // roda em qualquer página que tenha #grade-projetos
InovaAprender.templates.ativarHistorico(document); // roda em qualquer página que tenha #lista-historico
