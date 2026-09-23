/* integracoes.js — só a configuração da biblioteca externa (Day.js).
   Não conhece o histórico nem o formulário: expõe apenas formatarData().
   window.dayjs só existe se as 3 tags <script> do CDN (carregadas antes
   desta) tiverem respondido; sem elas, cai no JavaScript nativo. */
window.InovaAprender = window.InovaAprender || {};

InovaAprender.integracoes = (() => {
  if (window.dayjs && window.dayjs_plugin_relativeTime) {
    dayjs.extend(window.dayjs_plugin_relativeTime);
    dayjs.locale('pt-br');
  }

  function formatarData(iso) {
    if (window.dayjs) {
      const d = dayjs(iso);
      return `${d.format('DD/MM/YYYY, HH:mm')} (${d.fromNow()})`;
    }
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  return { formatarData };
})();
