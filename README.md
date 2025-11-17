# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# Git_NodeJS_Vite_ReactJS_TypeScript_Glide-Data-Grid
Aprendendo Git + NodeJS + Vite + ReactJS + TypeScript + Glide-Data-Grid (exemplos para consulta)

#### Instalar no PC
[git](https://git-scm.com/install/windows) Versiona o código para segurança e para voltar versão caso erro na ultima. 

[VSCode](https://code.visualstudio.com/download)  Para digitar o código e trabalhar no projeto.

[NodeJS](https://nodejs.org/pt/download) Para executar JavaScript. (check install tools, chocolatey, Pyton...)

```bash
  node -v
```

```bash
  npm -v
```
#### Novo projeto

Use o criador do Vite (versão mais recente), crie um novo projeto na pasta ‘meu-projeto’, usando o template React + TypeScript: (sem instalar o react)

```bash
npm create vite@latest meu-projeto -- --template react-ts --no-install
```
</br>
</br>

Se der erro faça assim:

Abra o PowerShell como Administrador

Pesquise no menu iniciar:

  PowerShell
  
  Clique com botão direito → Executar como administrador
  

Depois execute este comando:

```bash
Set-ExecutionPolicy RemoteSigned
```

Ele vai perguntar:

Tem certeza de que deseja alterar a política de execução?

[Y] Sim  [A] Sim para todos  ...


Digite:

A

</br>
</br>


Acessando o projeto:

```bash
cd meu-projeto
```

Instalar o react 18:  (o Glide-Data-Grid 6.0.3 só funciona no 18)
```bash
npm install react@18 react-dom@18
```

```bash
npm install
```

Agora você já tem React + TypeScript + Vite funcionando.

</br>
</br>

Instalar o Glide-Data-Grid no projeto atual:

```bash
npm install @glideapps/glide-data-grid
```

</br>
</br>



instale
Crie uma nova pasta para o projeto


Vite
ReactJS
TypeScript

[Glide-Data-Grid](https://grid.glideapps.com/)


01-Git (Exemplos de comandos comentados)


