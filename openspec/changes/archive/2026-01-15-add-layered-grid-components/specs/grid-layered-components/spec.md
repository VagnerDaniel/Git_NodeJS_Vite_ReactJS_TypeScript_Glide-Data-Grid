## ADDED Requirements
### Requirement: Componentes em camadas para o grid
O sistema MUST fornecer tres camadas de componente para o grid: DataEditor (base), GlideGridCore (defaults e pass-through nativo) e MyGlideGrid (super componente com funcionalidades do sistema).

#### Scenario: Uso em camadas
- **WHEN** um consumidor precisa do comportamento nativo
- **THEN** pode usar DataEditor diretamente sem alteracoes
- **WHEN** precisa de defaults do projeto
- **THEN** pode usar GlideGridCore com pass-through completo
- **WHEN** precisa de presets e features do sistema
- **THEN** pode usar MyGlideGrid com flags e presets

### Requirement: Presets e feature flags por dominio
O MyGlideGrid MUST aceitar presets e flags por dominio para ativar/desativar funcionalidades (ex: selecao, busca, edicao, menus, tema).

#### Scenario: Preset padrao com override
- **WHEN** o consumidor seleciona um preset
- **THEN** o componente aplica um conjunto de configuracoes predefinidas
- **WHEN** o consumidor fornece flags explicitas
- **THEN** as flags sobrescrevem o preset

### Requirement: Pass-through completo do DataEditor
O GlideGridCore MUST aceitar todas as props do DataEditor e repassa-las sem perda de funcionalidade.

#### Scenario: Uso de prop nativa nao mapeada
- **WHEN** uma prop nativa do DataEditor e informada no GlideGridCore
- **THEN** ela e repassada ao DataEditor sem alteracao

### Requirement: Compatibilidade com MyGrid legado
O sistema MUST manter o MyGrid legado funcional durante a migracao.

#### Scenario: Tela antiga
- **WHEN** uma tela ainda usa MyGrid
- **THEN** o comportamento atual permanece funcional ate migracao
