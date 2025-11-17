import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import DataEditor, {
  GridCellKind,
  type GridCell,
  type GridColumn,
  type Item,
} from "@glideapps/glide-data-grid"

import "@glideapps/glide-data-grid/dist/index.css"

function App() {
  const [count, setCount] = useState(0)

  type DummyItem = {
    name: string;
    company: string;
    email: string;
    phone: string;
  };

  const data: DummyItem[] = [
    { name: "Hines Fowler", company: "BUZZNESS", email: "hinesfowler@buzzness.com", phone: "+1 (869) 405-3127" },
    { name: "Alice Johnson", company: "TECHCORP", email: "alicej@techcorp.com", phone: "+1 (123) 456-7890" },
    { name: "Bob Smith", company: "INNOVATE", email: "bob@innovate.io", phone: "+1 (987) 654-3210" },
    // Adicione mais linhas se quiser testar scroll
  ]

  const columns: GridColumn[] = [
    { title: "Name", id: "name", width: 150 },
    { title: "Company", id: "company", width: 150 },
    { title: "Email", id: "email", width: 200 },
    { title: "Phone", id: "phone", width: 150 },
  ]
 
  const getCellContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell;
    const dataRow = data[row];
    // dumb but simple way to do this
    const indexes: (keyof DummyItem)[] = ["name", "company", "email", "phone"];
    const d = dataRow[indexes[col]]
    return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        displayData: d,
        data: d,
    };
  }, []); 


  return ( 
    <>
      <h1>Vite + React + Glide Data Grid</h1>

       <div style={{ height: 400, width: "100%" }}>
        <DataEditor
        // experimental={{
        //   strict: true
        // }}
        getCellContent={getCellContent}
        columns={columns}
        rows={data.length} 
        freezeColumns={0} // cabeçalho fixo
        rowMarkers="both" // números das linhas
        //rowMarkers="number"
        //rows={10000}
        getCellsForSelection
        smoothScrollX
        smoothScrollY
        trailingRowOptions={{
          hint: 'New row...',
          sticky: true,
          tint: true
        }}
        />
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
