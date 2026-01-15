## MODIFIED Requirements

### Requirement: Componentes em camadas para o grid
O sistema MUST fornecer tres camadas nitidamente separadas: DataEditor (nativa), GlideGridCore (defaults do projeto e pass-through) e MyGlideGrid (orquestrador de funcionalidades enterprise).

#### Scenario: Uso em camadas
- **WHEN** um consumidor precisa do comportamento nativo
- **THEN** pode usar DataEditor diretamente sem alteracoes
- **WHEN** precisa de defaults do projeto (CSS, behavior basico)
- **THEN** pode usar GlideGridCore com pass-through completo
- **WHEN** precisa de um "Super Grid" com funcionalidades gerenciadas (busca, menus, editores complexos)
- **THEN** deve usar MyGlideGrid que compõe sub-módulos independentes

### Requirement: Presets e feature flags por dominio
O MyGlideGrid MUST aceitar presets e flags por dominio para ativar/desativar funcionalidades, sendo que a lógica de cada funcionalidade deve ser isolada e só ativada quando necessário.

#### Scenario: Ativação modular de features
- **WHEN** uma feature (ex: busca) é desativada via flag
- **THEN** os hooks e componentes relacionados não devem ser instanciados ou executar lógica pesada
- **WHEN** um preset é selecionado
- **THEN** o componente aplica as flags correspondentes e carrega os módulos necessários

## ADDED Requirements

### Requirement: Arquitetura Modular Baseada em Hooks
O sistema MUST utilizar hooks customizados para gerenciar domínios lógicos separados (dados, seleção, busca, menus) dentro do MyGlideGrid, facilitando a extensão e testes.

#### Scenario: Extensibilidade do Grid
- **WHEN** um desenvolvedor precisa adicionar uma nova funcionalidade global (ex: exportação)
- **THEN** ele pode criar um novo hook customizado e injetá-lo na composição do MyGlideGrid sem alterar a lógica de core ou dados.

### Requirement: Sistema de Temas Enterprise
O sistema MUST fornecer um conjunto de variáveis CSS e tokens que permitem a personalização profunda da aparência sem quebra de layout.

#### Scenario: Troca de tema dinâmica
- **WHEN** as variáveis de tema no CSS global são alteradas
- **THEN** o grid e todos os seus sub-componentes (menus, busca) devem refletir as novas cores e estilos consistentemente.
