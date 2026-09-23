/* build.js — gera uma build de produção minificada em dist/, a partir dos
   arquivos-fonte (css/, js/, html/, index.html). Não usa um bundler com
   binário nativo (Vite/esbuild) porque o ambiente onde este projeto é
   compilado bloqueia a execução desses binários nativos (ver README/relatório).
   Em vez disso, usa três minificadores 100% JavaScript: terser (JS),
   clean-css (CSS) e html-minifier-terser (HTML). */
const fs = require('fs');
const path = require('path');
const { minify: minifyJs } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHtml } = require('html-minifier-terser');

const RAIZ = __dirname;
const DIST = path.join(RAIZ, 'dist');

function tamanho(caminho) {
  return fs.statSync(caminho).size;
}

function copiarPasta(origem, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const item of fs.readdirSync(origem)) {
    const o = path.join(origem, item);
    const d = path.join(destino, item);
    if (fs.statSync(o).isDirectory()) copiarPasta(o, d);
    else fs.copyFileSync(o, d);
  }
}

async function minificarCss(origem, destino) {
  const fonte = fs.readFileSync(origem, 'utf8');
  const resultado = new CleanCSS({ level: 2 }).minify(fonte);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado.styles);
}

async function minificarJs(origem, destino) {
  const fonte = fs.readFileSync(origem, 'utf8');
  const resultado = await minifyJs(fonte, { format: { comments: false } });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado.code);
}

async function minificarHtml(origem, destino) {
  const fonte = fs.readFileSync(origem, 'utf8');
  const resultado = await minifyHtml(fonte, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    conservativeCollapse: true,
  });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado);
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const relatorio = [];

  // CSS
  const cssOrigem = path.join(RAIZ, 'css/style.css');
  const cssDestino = path.join(DIST, 'css/style.css');
  await minificarCss(cssOrigem, cssDestino);
  relatorio.push(['css/style.css', tamanho(cssOrigem), tamanho(cssDestino)]);

  // JS
  const pastaJs = path.join(RAIZ, 'js');
  for (const arquivo of fs.readdirSync(pastaJs)) {
    const origem = path.join(pastaJs, arquivo);
    const destino = path.join(DIST, 'js', arquivo);
    await minificarJs(origem, destino);
    relatorio.push([`js/${arquivo}`, tamanho(origem), tamanho(destino)]);
  }

  // HTML (index.html na raiz + html/*.html)
  const arquivosHtml = ['index.html', ...fs.readdirSync(path.join(RAIZ, 'html')).map((a) => `html/${a}`)];
  for (const rel of arquivosHtml) {
    const origem = path.join(RAIZ, rel);
    const destino = path.join(DIST, rel);
    await minificarHtml(origem, destino);
    relatorio.push([rel, tamanho(origem), tamanho(destino)]);
  }

  // imagens: copiadas sem alteração (binários já otimizados, fora do escopo de minificação de texto)
  copiarPasta(path.join(RAIZ, 'imagens'), path.join(DIST, 'imagens'));

  // Relatório
  let totalOrigem = 0;
  let totalDestino = 0;
  console.log('\nArquivo'.padEnd(28) + 'Original'.padStart(10) + '  Minificado'.padStart(12) + '  Redução');
  for (const [nome, o, d] of relatorio) {
    totalOrigem += o;
    totalDestino += d;
    const reducao = (100 - (d / o) * 100).toFixed(1);
    console.log(nome.padEnd(28) + String(o).padStart(10) + String(d).padStart(12) + `  ${reducao}%`);
  }
  const reducaoTotal = (100 - (totalDestino / totalOrigem) * 100).toFixed(1);
  console.log('-'.repeat(64));
  console.log('TOTAL'.padEnd(28) + String(totalOrigem).padStart(10) + String(totalDestino).padStart(12) + `  ${reducaoTotal}%`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
