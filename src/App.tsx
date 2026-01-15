import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import MyGrid from './components/MyGrid'
import MyGlideGrid from './components/MyGlideGrid'
import { type GridColumn } from '@glideapps/glide-data-grid'

const columns: GridColumn[] = [
  { id: 'id', title: 'ID', width: 50 },
  { id: 'nome', title: 'Nome', width: 180 },
  { id: 'idade', title: 'Idade', width: 80 },
  { id: 'ativo', title: 'Ativo?', width: 80 },
  { id: 'progresso', title: 'Progresso', width: 120 },
  { id: 'email', title: 'E-mail', width: 220 },
  { id: 'status', title: 'Status', width: 100 },
]

const initialData = [
  { id: 1, nome: 'Ana Silva', idade: 22, ativo: true, progresso: 80, email: 'ana@exemplo.com', status: 'Ativo' },
  { id: 2, nome: 'Pedro Santos', idade: 34, ativo: false, progresso: 30, email: 'pedro@exemplo.com', status: 'Inativo' },
  { id: 3, nome: 'Lucas Oliveira', idade: 29, ativo: true, progresso: 100, email: 'lucas@exemplo.com', status: 'Ativo' },
  { id: 4, nome: 'Carla Souza', idade: 25, ativo: true, progresso: 45, email: 'carla@exemplo.com', status: 'Ativo' },
  { id: 5, nome: 'Marcos Lima', idade: 42, ativo: false, progresso: 10, email: 'marcos@exemplo.com', status: 'Inativo' },
  { id: 6, nome: 'Julia Rocha', idade: 27, ativo: true, progresso: 95, email: 'julia@exemplo.com', status: 'Ativo' },
]

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="main-title">Glide Data Grid Master</h1>

      <div style={{ textAlign: 'left', marginBottom: '20px', display: 'grid', gap: 24 }}>
        <section>
          <h2>MyGlideGrid - Full (todas as features ativas)</h2>
          <MyGlideGrid
            preset="default"
            columns={columns}
            initialData={initialData}
            features={{
              selection: true,
              search: { active: true, animation: "slide-left", offsetX: "20px", offsetY: "0px" },
              editing: true,
              sorting: true,
              columnReorder: true,
              columnResize: true,
              rowAppend: true,
              columnMenu: true,
              rowMenu: true,
              stats: true,
              locking: true,
            }}
          />
        </section>

        <section>
          <h2>MyGlideGrid - Default (preset padrao)</h2>
          <MyGlideGrid columns={columns} initialData={initialData} />
        </section>

        <section>
          <h2>MyGlideGrid - ReadOnly</h2>
          <MyGlideGrid
            preset="readOnly"
            columns={columns}
            initialData={initialData}
            features={{ search: true, stats: true }}
          />
        </section>

        <section>
          <h2>MyGlideGrid - Compact com menus desativados</h2>
          <MyGlideGrid
            preset="compact"
            columns={columns}
            initialData={initialData}
            features={{ columnMenu: false, rowMenu: false }}
          />
        </section>

        <section>
          <h2>MyGlideGrid - Audit com busca controlada</h2>
          <MyGlideGrid
            preset="audit"
            columns={columns}
            initialData={initialData}
            showSearch={true}
          />
        </section>

        <section>
          <h2>MyGrid (legado)</h2>
          <MyGrid
            columns={columns}
            initialData={initialData}
            // --- Funcionalidades de Interface ---
            rowMarkers="both"
            freezeColumns={1}
            verticalBorder={true}
            headerHeight={44}
            rowHeight={38}

            // --- Funcionalidades de Interacao ---
            isEditable={true}
            rangeSelect="multi-rect"
            columnSelect="multi"
            rowSelect="multi"
            fillHandle={true}

            // --- Customizacao de Edicao ---
            editableColumns={{ id: false }}

            // --- Performance & UX ---
            smoothScrollX={true}
            smoothScrollY={true}
            getCellsForSelection={true}

            // --- Tooling ---
            onColumnMoved={(f, t) => console.log(`Moved from ${f} to ${t}`)}

            // ============================================
            // --- Funcionalidades EXTRA MYGRID ---
            // (Funcionalidades customizadas nao nativas do Glide Data Grid)
            // ============================================

            // Mostra estatisticas de registros no topo
            showStats={true}
            // Titulo customizado do botao de bloqueio
            lockButtonTitle="Bloquear"
            // Habilita menu de contexto no header (colunas)
            enableColumnContextMenu={true}
            // Habilita menu de contexto nas linhas
            enableRowContextMenu={true}
            // Customizacao de cores do grid
            gridColors={{
              bgGrid: '#b1b1b1ff', // Cor de fundo do grid (area vazia)
              bgCell: '#ffababff', // Cor de fundo das celulas com dados
              borderHorizontal: 'rgba(37, 107, 236, 0.74)', // Bordas horizontais da matriz
              borderVertical: 'rgba(42, 238, 51, 0.78)', // Bordas verticais da matriz
              borderHeader: 'rgba(0, 0, 0, 1)', // Bordas do header
              borderRowMarker: 'rgba(203, 37, 224, 0.77)', // Bordas do identificador de linha
            }}
          />
        </section>
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
