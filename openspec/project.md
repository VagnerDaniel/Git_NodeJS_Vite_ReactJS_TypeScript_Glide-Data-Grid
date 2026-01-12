# Contexto do Projeto

## Propósito
Este projeto é um ambiente de aprendizado e desenvolvimento focado na implementação e customização do `glide-data-grid`. O objetivo é criar uma grade de dados de alta performance e rica em recursos para aplicações web, com foco em facilitar a ativação/desativação de funcionalidades de maneira dinâmica através de props do componente `MyGrid`.

## Tech Stack
- **Frontend**: React 18 (utilizando Vite como ferramenta de build)
- **Linguagem**: TypeScript
- **Componente de Grade**: `@glideapps/glide-data-grid`
- **Utilidades**: `lodash`, `marked` exigidos pelo glide-data-grid (para renderização de markdown)
- **UI/UX**: `react-responsive-carousel`, também para glide-data-grid, CSS puro para estilização.

## Convenções do Projeto

### Estilo de Código
- **Idioma**: Comentários e documentação em **Português BR**.
- **Componentes**: Devem ser funcionais, utilizando Arrow Functions.
- **Tipagem**: Uso rigoroso de TypeScript para interfaces e tipos.
- **CSS**: `.css` modulares ou globais dependendo do escopo.

### Padrões de Arquitetura
- **Componentes**: Localizados em `src/components/`.
- **Lógica de Dados**: Mantida separada dos componentes de visualização sempre que possível.
- **Assets**: Imagens e outros recursos estáticos dentro de `src/assets/`.

### Fluxo de Git
- **Sincronização**: Manter o repositório local sincronizado com o GitHub (`origin main`).
- **Commits**: Mensagens claras descrevendo as mudanças realizadas.

## Contexto de Domínio
O projeto lida com a exibição de grandes conjuntos de dados (grids) que exigem renderização eficiente (canvas-based). É importante entender o funcionamento das células e headers do `glide-data-grid`.

## Restrições Importantes
- Manter a compatibilidade com navegadores modernos que suportam Canvas API.
- Evitar o uso desnecessário de bibliotecas externas pesadas que possam impactar na performance da grade.

## Dependências Externas
- GitHub para hospedagem e controle de versão.
- npm para gerenciamento de pacotes.
