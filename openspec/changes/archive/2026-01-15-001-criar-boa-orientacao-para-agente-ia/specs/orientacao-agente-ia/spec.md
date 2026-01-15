## ADDED Requirements
### Requirement: Guia de orientacao do agente
O projeto SHALL manter um guia de orientacao para agentes IA com objetivo, escopo, restricoes e exemplos minimos de uso.

#### Scenario: Agente inicia uma nova tarefa
- **WHEN** o agente abre o guia de orientacao
- **THEN** encontra objetivo, escopo, restricoes e exemplos minimos

### Requirement: Padrao de idioma e comunicacao
O guia SHALL exigir que comentarios e documentacao sejam escritos em Portugues BR.

#### Scenario: Agente cria ou edita documentacao
- **WHEN** o agente adiciona comentarios ou documentacao
- **THEN** usa Portugues BR conforme o guia

### Requirement: Fluxo OpenSpec para mudancas
O guia SHALL descrever o fluxo de criacao de propostas, validacao e aprovacao antes da implementacao.

#### Scenario: Agente precisa propor uma mudanca
- **WHEN** o agente inicia uma proposta
- **THEN** segue as etapas de criacao, validacao e aprovacao descritas no guia