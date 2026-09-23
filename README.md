# InovaAprender

Site institucional da ONG InovaAprender, com foco em inovação educacional.

## Sobre o projeto

Site estático multi-página desenvolvido em HTML5 semântico, CSS3 e JavaScript (vanilla, sem frameworks). Usa a biblioteca externa [Day.js](https://day.js.org/) (v1.11.10, via CDN cdnjs, com locale pt-br e o plugin relativeTime) para formatação de datas.

## Paginas

- `index.html` — pagina inicial
- `html/cadastro.html` — cadastro com formulario, validacoes e mascaras (CPF, telefone, CEP)
- `html/componentes.html` — componentes reutilizaveis de interface
- `html/projetos.html` — projetos desenvolvidos pela ONG

## Estrutura

- `css/` — estilizacao do site
- `js/` — scripts (armazenamento local, validacoes, integracoes, navegacao SPA, templates)
- `imagens/` — recursos visuais

## Pre-requisitos

- Um navegador atualizado (Chrome, Firefox, Edge)
- Conexao com a internet, para carregar o Day.js via CDN
- Nao ha dependencias para instalar nem etapa de build: o projeto nao usa Node/npm, gerenciador de pacotes ou bundler

## Instalacao e execucao local

1. Clonar o repositorio: `git clone https://github.com/grazizanetti2-dotcom/InovaAprender.git`
2. Entrar na pasta do projeto: `cd InovaAprender`
3. Abrir `index.html` diretamente no navegador, ou servir a pasta com um servidor local (ex.: extensao Live Server do VS Code, ou `python -m http.server` e acessar `http://localhost:8000`)

Nao ha comandos de build ou de testes automatizados: por ser um site estatico, o resultado e visualizado diretamente no navegador.

## Versionamento

Projeto organizado seguindo o padrao GitFlow (`main`, `develop`, `feature/*`), com mensagens de commit no padrao Conventional Commits e releases versionadas via SemVer (tag `v1.0.0`). O uso de issues, milestones e pull requests do GitHub documenta e rastreia as tarefas de cada etapa.
