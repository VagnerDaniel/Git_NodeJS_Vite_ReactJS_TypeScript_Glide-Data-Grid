# Change: Criar arquitetura em camadas para o grid

## Why
Preciso de uma arquitetura em camadas para padronizar o uso do glide-data-grid e permitir ativar/desativar funcionalidades por parametros, facilitando reutilizacao em varias telas.

## What Changes
- Camada 1: uso direto do DataEditor do glide-data-grid, com comportamento e CSS nativos.
- Camada 2: novo componente base (nome inventado: GlideGridCore) para centralizar defaults e expor todas as opcoes nativas do DataEditor.
- Camada 3: MyGlideGrid vira o super componente com presets e feature flags, ativando/desativando funcionalidades por camadas.
- Definicao de API com presets e flags por dominio (selecao, busca, edicao, menus, tema, etc.).
- Plano de migracao gradual do MyGrid legado para MyGlideGrid.

## Impact
- Affected specs: grid-layered-components
- Affected code: src/components/GlideGridCore.tsx, src/components/MyGlideGrid.tsx, src/components/MyGrid.tsx, src/App.tsx
