# Mudanca: Criar boa orientacao para agente IA

## Por que
Estabelecer diretrizes claras e consistentes para agentes IA seguirem os padroes do projeto, reduzindo retrabalho e divergencias.

## O que muda
- Criar uma nova capacidade de especificacao para orientar agentes IA.
- Definir conteudo minimo do guia (objetivo, escopo, restricoes e exemplos).
- Documentar o fluxo OpenSpec para propostas e validacao.
- Informar onde o componente enterprise de grid deve ficar no projeto e qual base tecnica usar.

## Onde fica no projeto
- Arquivo principal do componente: src/components/MyGlideGrid.tsx
- Arquivo legado/temporario: src/components/MyGrid.tsx
- Documentacao do projeto (orientacoes gerais): AGENTS.md
- Especificacoes e propostas: openspec/ (propostas em openspec/changes)

## Base tecnica e referencia
O componente de grid devera ser construido com base no projeto `glide-data-grid`:
- Repositorio: https://github.com/glideapps/glide-data-grid
- Documentacao de referencia: https://glideapps.github.io/glide-data-grid/?path=/story/glide-data-grid-dataeditor-demos--add-columns

## Impacto
- Especificacoes afetadas: orientacao-agente-ia (nova)
- Codigo/documentacao afetados: documentacao em openspec/changes e AGENTS.md
