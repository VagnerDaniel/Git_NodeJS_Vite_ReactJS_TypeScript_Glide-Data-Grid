# Minhas Regras Personalizadas
- Sempre use Português BR nos comentários e documentação.

- Criar um componente de grid nível enterprise.
- Componente principal: src/components/MyGlideGrid.tsx.
- MyGrid.tsx é legado/temporário até migração completa.
- Repositorio: https://github.com/glideapps/glide-data-grid
- Documentacao de referencia: https://glideapps.github.io/glide-data-grid/?path=/story/glide-data-grid-dataeditor-demos--add-columns

estou pensando em ter um super hiper master componente que me deixe passar nos parÂmetros se ativa ou desativa determinada função/característica, pra ficar como padrão de um projeto. sendo em camadas, primeiro o componente normal glide-data-grid com seu comportamento e css natural, segundo o comportamento e css no novo componente MyGlideGrid onde serão implementados todos as caracteristicas e funçoes possíveis naturais do componente. E depois serão criadas mais características, funções, design... para facilitar a implantação num sistema com padrão reutilizado em várias telas do sistema, podendo em cada situação ativar/desativar cada funcionalidade.

Camada 1: usar o DataEditor do Glide “puro” (comportamento e CSS nativos).
Camada 2: MyGlideGrid como wrapper que aplica defaults do projeto + habilita/expõe TODOS os recursos nativos do Glide (pass‑through de props, mais alguns controles).
Camada 3: “super componente” (ex: MyEnterpriseGrid) que adiciona features próprias do sistema e usa flags/“presets” para ligar/desligar grupos de funcionalidades.


<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
