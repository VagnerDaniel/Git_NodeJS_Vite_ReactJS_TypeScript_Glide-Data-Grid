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

Caso dê erro de scripts desabilitado use este comando pra liberar:

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

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

## Baixar do github

instale
Crie uma nova pasta para o projeto


Vite
ReactJS
TypeScript

[Glide-Data-Grid](https://grid.glideapps.com/)


01-Git (Exemplos de comandos comentados)


