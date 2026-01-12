import { useState, useCallback } from "react";
import DataEditor, {
    type GridColumn,
    type Item,
    GridCellKind,
    type GridCell,
    type GridSelection,
    CompactSelection,
    type TextCell,
} from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";

interface Pessoa {
    id: number;
    nome: string;
    idade: number;
    email: string;
    status: "Ativo" | "Inativo";
}

// Configurações globais
const GRID_EDITABLE_DEFAULT = true;

const columns: GridColumn[] = [
    { id: "id", title: "ID", width: 50 },
    { id: "nome", title: "Nome", width: 200 },
    { id: "idade", title: "Idade", width: 80 },
    { id: "email", title: "E-mail", width: 250 },
    { id: "status", title: "Status", width: 100 },
];

const initialData: Pessoa[] = [
    { id: 1, nome: "Ana Silva", idade: 22, email: "ana@exemplo.com", status: "Ativo" },
    { id: 2, nome: "Pedro Santos", idade: 34, email: "pedro@exemplo.com", status: "Inativo" },
    { id: 3, nome: "Lucas Oliveira", idade: 29, email: "lucas@exemplo.com", status: "Ativo" },
    { id: 4, nome: "Carla Souza", idade: 25, email: "carla@exemplo.com", status: "Ativo" },
    { id: 5, nome: "Marcos Lima", idade: 42, email: "marcos@exemplo.com", status: "Inativo" },
];

const editableColumns: Record<string, boolean> = {
    id: false,
    nome: true,
    idade: true,
    email: true,
    status: true,
};

export default function MyGrid() {
    const [rowsData, setRowsData] = useState<Pessoa[]>(initialData);
    const [isEditable, setIsEditable] = useState(GRID_EDITABLE_DEFAULT);

    const [selection, setSelection] = useState<GridSelection>({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
    });

    // Memoizar o conteúdo para performance (essencial no glide-data-grid)
    const getCellContent = useCallback(([col, row]: Item): GridCell => {
        const columnId = columns[col].id as keyof Pessoa;
        const rowData = rowsData[row];
        const value = rowData[columnId];

        const isColEditable = !!editableColumns[columnId];

        // Customização por tipo de dado (exemplo de expansão futura)
        if (columnId === "status") {
            return {
                kind: GridCellKind.Text,
                data: String(value),
                displayData: String(value),
                allowOverlay: isEditable && isColEditable,
                contentAlign: "center",
                themeOverride: {
                    textDark: value === "Ativo" ? "#4CAF50" : "#F44336",
                }
            } as TextCell;
        }

        return {
            kind: GridCellKind.Text,
            data: String(value),
            displayData: String(value),
            allowOverlay: isEditable && isColEditable,
            readonly: !isEditable || !isColEditable,
        } as TextCell;
    }, [rowsData, isEditable]);

    const onCellEdited = useCallback(([col, row]: Item, newValue: GridCell) => {
        if (newValue.kind !== GridCellKind.Text) return;

        const columnId = columns[col].id as keyof Pessoa;

        setRowsData(prev => {
            const newData = [...prev];
            newData[row] = {
                ...newData[row],
                [columnId]: newValue.data
            };
            return newData;
        });
    }, []);

    const onSelectionChange = useCallback((newSelection: GridSelection) => {
        setSelection(newSelection);
    }, []);

    const onRowAppended = useCallback(() => {
        const newPessoa: Pessoa = {
            id: rowsData.length + 1,
            nome: "",
            idade: 0,
            email: "",
            status: "Ativo"
        };
        setRowsData(prev => [...prev, newPessoa]);
    }, [rowsData.length]);

    return (
        <div className="grid-container">
            <div className="grid-controls">
                <button
                    className={`btn-toggle ${isEditable ? 'active' : ''}`}
                    onClick={() => setIsEditable(v => !v)}
                >
                    {isEditable ? "🔒 Bloquear Edição" : "🔓 Liberar Edição"}
                </button>
                <span className="grid-stats">
                    Total de registros: <strong>{rowsData.length}</strong>
                </span>
            </div>

            <div className="grid-wrapper">
                <DataEditor
                    width="100%"
                    height="100%"
                    columns={columns}
                    getCellContent={getCellContent}
                    rows={rowsData.length}
                    onCellEdited={onCellEdited}
                    gridSelection={selection}
                    onGridSelectionChange={onSelectionChange}
                    onRowAppended={onRowAppended}
                    rowMarkers="both"
                    smoothScrollX={true}
                    smoothScrollY={true}
                    getCellsForSelection={true}
                    trailingRowOptions={{
                        hint: "Adicionar nova linha...",
                        sticky: true,
                        tint: true,
                    }}
                />
            </div>
        </div>
    );
}

