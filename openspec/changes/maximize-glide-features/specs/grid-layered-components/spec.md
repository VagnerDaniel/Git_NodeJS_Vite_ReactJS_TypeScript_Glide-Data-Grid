## MODIFIED Requirements

### Requirement: Componentes em camadas para o grid
O MyGlideGrid MUST expor e gerenciar a totalidade das funcionalidades nativas do Glide Data Grid, incluindo tipos de células avançados e comportamentos de layout complexos.

#### Scenario: Suporte a Células Ricas
- **WHEN** uma coluna é configurada para Markdown ou Imagem
- **THEN** o MyGlideGrid deve renderizar o conteúdo utilizando o respectivo tipo de célula do Glide, processando Markdown se aplicável.

### Requirement: Presets e feature flags por dominio
O MyGlideGrid MUST incluir flags para comportamentos avançados como reordenação de linhas e congelamento de colunas.

#### Scenario: Reordenação de Linhas
- **WHEN** a flag `rowReorder` está ativa
- **THEN** o usuário deve ser capaz de arrastar linhas para mudar sua ordem, refletindo no estado de dados.

## ADDED Requirements

### Requirement: Agrupamento de Cabeçalhos
O sistema SHALL suportar o agrupamento de cabeçalhos (Group Headers) para organizar colunas relacionadas.

#### Scenario: Visualização Organizacional
- **WHEN** colunas possuem a propriedade `group` definida
- **THEN** o grid deve exibir um cabeçalho superior agrupando essas colunas.
