/* formulario.js — máscaras, validação e envio do formulário de cadastro.
   Ao concluir um envio, pede a InovaAprender.armazenamento para guardar o
   registro e a InovaAprender.templates para atualizar a lista na tela — não
   grava no localStorage nem clona <template> por conta própria. */
window.InovaAprender = window.InovaAprender || {};

InovaAprender.formulario = (() => {
  function formatarCPF(v) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function formatarTelefone(v) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  }
  function formatarCEP(v) {
    return v.replace(/\D/g, '').slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  const MENSAGENS_PADRAO = {
    cpf: 'CPF incompleto ou fora do formato 000.000.000-00.',
    telefone: 'Telefone incompleto ou fora do formato (00) 00000-0000.',
    cep: 'CEP incompleto ou fora do formato 00000-000.',
  };

  function validarCampo(campo) {
    const erro = document.getElementById('erro-' + campo.name);
    if (!erro) return true; // campo sem verificação (ex.: mensagem, opcional)

    let mensagem = '';
    if (campo.validity.valueMissing) {
      mensagem = campo.type === 'checkbox' ? 'É preciso aceitar os termos para continuar.' : 'Este campo é obrigatório.';
    } else if (campo.validity.typeMismatch) {
      mensagem = 'Digite um e-mail válido, no formato nome@email.com.';
    } else if (campo.validity.tooShort) {
      mensagem = `Digite pelo menos ${campo.minLength} caracteres.`;
    } else if (campo.validity.patternMismatch) {
      mensagem = MENSAGENS_PADRAO[campo.name] || 'Formato inválido.';
    }

    erro.textContent = mensagem;
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    return !mensagem;
  }

  function ativarFormulario(escopo) {
    const form = escopo.querySelector('#form-cadastro');
    if (!form) return; // esta página/rota não tem o formulário de cadastro

    const mascaras = [['#cpf', formatarCPF], ['#telefone', formatarTelefone], ['#cep', formatarCEP]];
    mascaras.forEach(([seletor, formatar]) => {
      const campo = form.querySelector(seletor);
      campo?.addEventListener('input', () => { campo.value = formatar(campo.value); });
    });

    const campos = [...form.querySelectorAll('input, select, textarea')].filter((c) => c.type !== 'submit');
    campos.forEach((campo) => {
      // valida ao sair do campo (não incomoda enquanto a pessoa ainda está digitando)
      campo.addEventListener('blur', () => validarCampo(campo));
      // corrige ao vivo: se já havia erro mostrado, reavalia a cada tecla/seleção
      campo.addEventListener('input', () => {
        if (document.getElementById('erro-' + campo.name)?.textContent) validarCampo(campo);
      });
      campo.addEventListener('change', () => {
        if (document.getElementById('erro-' + campo.name)?.textContent) validarCampo(campo);
      });
    });

    form.addEventListener('submit', (evento) => {
      evento.preventDefault(); // sem backend: a SPA é quem trata o envio

      let primeiroInvalido = null;
      campos.forEach((campo) => {
        const valido = validarCampo(campo);
        if (!valido && !primeiroInvalido) primeiroInvalido = campo;
      });
      if (primeiroInvalido) { primeiroInvalido.focus(); return; }

      const feedback = escopo.querySelector('#feedback-cadastro');
      if (feedback) {
        feedback.hidden = false;
        feedback.setAttribute('tabindex', '-1');
        feedback.focus();
        feedback.scrollIntoView({ block: 'center' });
      }

      const registros = InovaAprender.armazenamento.lerHistorico();
      registros.push({
        nome: form.querySelector('#nome').value,
        tipo: form.querySelector('#tipo').selectedOptions[0].text,
        data: new Date().toISOString(),
      });
      InovaAprender.armazenamento.salvarHistorico(registros);
      InovaAprender.templates.renderizarHistorico(escopo);

      form.reset();
      campos.forEach((campo) => { document.getElementById('erro-' + campo.name)?.replaceChildren(); campo.removeAttribute('aria-invalid'); });
    });
  }

  return { ativarFormulario };
})();

InovaAprender.formulario.ativarFormulario(document); // roda em qualquer página que tenha #form-cadastro
