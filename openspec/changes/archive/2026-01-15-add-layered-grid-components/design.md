## Contexto
O projeto precisa de um componente de grid com padrao reutilizavel e configuravel por flags, sem perder o acesso a todas as opcoes nativas do glide-data-grid.

## Goals / Non-Goals
- Goals: padronizar uso do grid, permitir presets e flags por dominio, manter pass-through completo do DataEditor.
- Non-Goals: remover MyGrid legado nesta fase, criar tema visual completo ou novos plugins externos.

## Decisoes
- Decisao: criar tres camadas (DataEditor, GlideGridCore, MyGlideGrid) para separar base, defaults e features do sistema.
- Alternativas consideradas: usar apenas um wrapper com muitas props. Rejeitado por acoplamento e baixa clareza.

## Riscos / Trade-offs
- Risco: API extensa e dificil de aprender. Mitigacao: presets e grupos de flags por dominio.

## Migration Plan
1. Introduzir GlideGridCore e MyGlideGrid sem quebrar MyGrid.
2. Migrar telas novas para MyGlideGrid.
3. Migrar telas antigas gradualmente e depois descontinuar MyGrid.

## Open Questions
- Lista final de presets padrao (ex: default, compact, readOnly, audit).
