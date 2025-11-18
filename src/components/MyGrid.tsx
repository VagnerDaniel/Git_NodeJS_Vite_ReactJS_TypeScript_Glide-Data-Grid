import { useState } from "react";
import DataEditor, {
  type GridColumn,
  type Item,
  type TextCell,
  GridCellKind,
  type GridCell,
} from "@glideapps/glide-data-grid";

interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

// Constante para definir se o grid inicia editável
const Grid_Editable: boolean = false;

// Colunas do grid
const columns: GridColumn[] = [
  { id: "id", title: "ID", width: 80 },
  { id: "nome", title: "Nome", width: 200 },
  { id: "idade", title: "Idade", width: 100 },
] as const;

// Dados iniciais
const data: Pessoa[] = [
  { id: 1, nome: "Ana", idade: 22 },
  { id: 2, nome: "Pedro", idade: 34 },
  { id: 3, nome: "Lucas", idade: 29 },
];

// Colunas editáveis
const editableColumns: Record<string, boolean> = {
  id: false,   // ID não é editável
  nome: true,
  idade: true,
};

export default function MyGrid() {
  const [rowsData, setRowsData] = useState<Pessoa[]>(data);
  const [editable, setEditable] = useState(Grid_Editable); // flag global

  // Retorna o conteúdo da célula
  const getContent = ([col, row]: Item): TextCell => {
    const columnId = columns[col].id as keyof Pessoa;
    const value = rowsData[row][columnId];
    return {
      kind: GridCellKind.Text,
      data: String(value),
      displayData: String(value),
      allowOverlay: editable && !!editableColumns[columnId], // depende da flag global e da coluna
    };
  };

  // Função separada para lidar com edição de células
  const handleCellEdited = (cell: Item, newValue: GridCell) => {
    const [col, row] = cell;
    const columnId = columns[col].id as keyof Pessoa;

    if (!editable || !editableColumns[columnId]) return; // verifica flags
    if (newValue.kind !== GridCellKind.Text) return; // só aceita texto

    setRowsData(prev => {
      const copy = [...prev];
      copy[row] = { ...copy[row], [columnId]: newValue.data };
      return copy;
    });
  };

  return (
    <div>
      <button onClick={() => setEditable(prev => !prev)}>
        {editable ? "Desabilitar Edição" : "Habilitar Edição"}
      </button>

      <div id="portal" style={{ height: "40vh", marginTop: "1rem" }}>
        <DataEditor
          columns={columns}
          getCellContent={getContent}
          rows={rowsData.length}
          onCellEdited={handleCellEdited}
          freezeColumns={0} // cabeçalho fixo
          rowMarkers="both" // números das linhas
          smoothScrollX
          smoothScrollY
          trailingRowOptions={{
            hint: "Nova linha...",
            sticky: true,
            tint: true,
          }}
        />
      </div>
    </div>
  );
}
