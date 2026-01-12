import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import MyGrid from './components/MyGrid';
import { type GridColumn } from "@glideapps/glide-data-grid";

const columns: GridColumn[] = [
  { id: "id", title: "ID", width: 50 },
  { id: "nome", title: "Nome", width: 180 },
  { id: "idade", title: "Idade", width: 80 },
  { id: "ativo", title: "Ativo?", width: 80 },
  { id: "progresso", title: "Progresso", width: 120 },
  { id: "email", title: "E-mail", width: 220 },
  { id: "status", title: "Status", width: 100 },
];

const initialData = [
  { id: 1, nome: "Ana Silva", idade: 22, ativo: true, progresso: 80, email: "ana@exemplo.com", status: "Ativo" },
  { id: 2, nome: "Pedro Santos", idade: 34, ativo: false, progresso: 30, email: "pedro@exemplo.com", status: "Inativo" },
  { id: 3, nome: "Lucas Oliveira", idade: 29, ativo: true, progresso: 100, email: "lucas@exemplo.com", status: "Ativo" },
  { id: 4, nome: "Carla Souza", idade: 25, ativo: true, progresso: 45, email: "carla@exemplo.com", status: "Ativo" },
  { id: 5, nome: "Marcos Lima", idade: 42, ativo: false, progresso: 10, email: "marcos@exemplo.com", status: "Inativo" },
  { id: 6, nome: "Julia Rocha", idade: 27, ativo: true, progresso: 95, email: "julia@exemplo.com", status: "Ativo" },
];

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="main-title">Glide Data Grid Master</h1>

      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <MyGrid
          columns={columns}
          initialData={initialData}
          // --- Funcionalidades de Interface ---
          rowMarkers="both"
          freezeColumns={1}
          verticalBorder={true}
          headerHeight={44}
          rowHeight={38}

          // --- Funcionalidades de Interação ---
          isEditable={true}
          rangeSelect="multi-rect"
          columnSelect="multi"
          rowSelect="multi"
          fillHandle={true}

          // --- Customização de Edição ---
          editableColumns={{ id: false }}

          // --- Performance & UX ---
          smoothScrollX={true}
          smoothScrollY={true}
          getCellsForSelection={true}

          // --- Tooling ---
          onColumnMoved={(f, t) => console.log(`Moved from ${f} to ${t}`)}
        />
      </div>
      <div>
        <p>Ola...</p>
      </div>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
