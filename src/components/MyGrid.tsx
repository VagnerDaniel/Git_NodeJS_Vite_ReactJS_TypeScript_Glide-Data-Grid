import { useState, useCallback, useMemo } from "react";
import DataEditor, {
    type GridColumn,
    type Item,
    GridCellKind,
    type GridCell,
    type GridSelection,
    CompactSelection,
    type TextCell,
    type DataEditorProps,
} from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";

// Interface para os dados do Grid (exemplo padrão)
export interface GridDataRecord {
    id: number;
    [key: string]: any;
}

interface MyGridProps extends Partial<DataEditorProps> {
    /** Dados iniciais da grade */
    initialData?: GridDataRecord[];
    /** Configuração de colunas */
    columns: GridColumn[];
    /** Define se a edição está habilitada globalmente */
    isEditable?: boolean;
    /** Mapeamento de colunas que podem ser editadas */
    editableColumns?: Record<string, boolean>;
    /** Mostrar contador de registros no topo */
    showStats?: boolean;
    /** Título customizado para o botão de trava */
    lockButtonTitle?: string;
    /** Callback disparado quando os dados mudam internamente */
    onDataChange?: (newData: GridDataRecord[]) => void;
}

const DEFAULT_EDITABLE_COLUMNS: Record<string, boolean> = {};

export default function MyGrid(props: MyGridProps) {
    const {
        initialData = [],
        columns,
        isEditable: isEditableProp = true,
        editableColumns = DEFAULT_EDITABLE_COLUMNS,
        showStats = true,
        lockButtonTitle,
        onDataChange,
        // Repassar as demais props do DataEditor
        rowMarkers = "both",
        smoothScrollX = true,
        smoothScrollY = true,
        getCellsForSelection = true,
        onRowAppended: onRowAppendedProp,
        trailingRowOptions,
        ...rest
    } = props;

    const [rowsData, setRowsData] = useState<GridDataRecord[]>(initialData);
    const [isLocked, setIsLocked] = useState(!isEditableProp);
    const [internalColumns, setInternalColumns] = useState<GridColumn[]>(columns);

    const [selection, setSelection] = useState<GridSelection>({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
    });

    // Sincroniza estado de edição quando a prop muda
    useMemo(() => {
        setIsLocked(!isEditableProp);
    }, [isEditableProp]);

    // Sincroniza colunas internas quando a prop muda
    useMemo(() => {
        setInternalColumns(columns);
    }, [columns]);

    const getCellContent = useCallback(([col, row]: Item): GridCell => {
        const column = internalColumns[col];
        const columnId = column.id as string;
        const rowData = rowsData[row];
        const value = rowData ? rowData[columnId] : undefined;

        const isColEditable = editableColumns[columnId] !== false;
        const canEdit = !isLocked && isColEditable;

        // Lógica de tipos de células baseada no valor ou na coluna
        if (typeof value === "boolean") {
            return {
                kind: GridCellKind.Boolean,
                data: value,
                allowOverlay: false,
                readonly: !canEdit,
            };
        }

        if (columnId === "idade" || typeof value === "number") {
            return {
                kind: GridCellKind.Number,
                data: Number(value),
                displayData: String(value),
                allowOverlay: canEdit,
            };
        }

        if (columnId === "progresso") {
            return {
                kind: GridCellKind.Number,
                data: Number(value),
                displayData: `${value}%`,
                allowOverlay: canEdit,
                readonly: !canEdit,
            };
        }

        // Customização visual para "Status"
        if (columnId === "status") {
            return {
                kind: GridCellKind.Text,
                data: String(value || ""),
                displayData: String(value || ""),
                allowOverlay: canEdit,
                contentAlign: "center",
                themeOverride: {
                    textDark: value === "Ativo" ? "#4CAF50" : "#F44336",
                }
            } as TextCell;
        }

        return {
            kind: GridCellKind.Text,
            data: String(value || ""),
            displayData: String(value || ""),
            allowOverlay: canEdit,
            readonly: !canEdit,
        } as TextCell;
    }, [rowsData, isLocked, internalColumns, editableColumns]);

    const onCellEdited = useCallback(([col, row]: Item, newValue: GridCell) => {
        const columnId = internalColumns[col].id as string;
        let finalValue: any = undefined;

        if (newValue.kind === GridCellKind.Text) finalValue = newValue.data;
        if (newValue.kind === GridCellKind.Boolean) finalValue = newValue.data;
        if (newValue.kind === GridCellKind.Number) finalValue = newValue.data;

        setRowsData(prev => {
            const newData = [...prev];
            newData[row] = {
                ...newData[row],
                [columnId]: finalValue
            };
            if (onDataChange) onDataChange(newData);
            return newData;
        });
    }, [internalColumns, onDataChange]);

    const onSelectionChange = useCallback((newSelection: GridSelection) => {
        setSelection(newSelection);
    }, []);

    const handleRowAppended = useCallback(() => {
        if (onRowAppendedProp) {
            onRowAppendedProp();
            return;
        }

        const newRecord: GridDataRecord = {
            id: rowsData.length + 1,
        };
        internalColumns.forEach(c => {
            if (c.id && c.id !== "id") {
                // Tenta inferir valor padrão pelo tipo
                newRecord[c.id as string] = c.id === "status" ? "Ativo" : (c.id === "idade" ? 0 : "");
            }
        });

        const newData = [...rowsData, newRecord];
        setRowsData(newData);
        if (onDataChange) onDataChange(newData);
    }, [rowsData.length, internalColumns, onRowAppendedProp, onDataChange]);

    const onColumnMoved = useCallback((from: number, to: number) => {
        setInternalColumns(prev => {
            const newCols = [...prev];
            const [moved] = newCols.splice(from, 1);
            newCols.splice(to, 0, moved);
            return newCols;
        });
    }, []);

    const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
        setInternalColumns(prev => {
            return prev.map(c => c.id === column.id ? { ...c, width: newSize } : c);
        });
    }, []);

    const [showSearch, setShowSearch] = useState(false);

    return (
        <div className="grid-container">
            <div className="grid-controls">
                <div className="left-controls">
                    <button
                        className={`btn-toggle ${!isLocked ? 'active' : ''}`}
                        onClick={() => setIsLocked(v => !v)}
                    >
                        {!isLocked ? "🔒 Bloquear" : lockButtonTitle || "🔓 Editar"}
                    </button>
                    <button
                        className="btn-toggle"
                        onClick={() => setShowSearch(v => !v)}
                    >
                        🔍 Buscar
                    </button>
                </div>
                {showStats && (
                    <span className="grid-stats">
                        Total de registros: <strong>{rowsData.length}</strong>
                    </span>
                )}
            </div>

            <div className="grid-wrapper">
                <DataEditor
                    width="100%"
                    height="100%"
                    columns={internalColumns}
                    getCellContent={getCellContent}
                    rows={rowsData.length}
                    onCellEdited={onCellEdited}
                    gridSelection={selection}
                    onGridSelectionChange={onSelectionChange}
                    onRowAppended={handleRowAppended}
                    onColumnMoved={onColumnMoved}
                    onColumnResize={onColumnResize}
                    rowMarkers={rowMarkers}
                    smoothScrollX={smoothScrollX}
                    smoothScrollY={smoothScrollY}
                    getCellsForSelection={getCellsForSelection}
                    showSearch={showSearch}
                    onSearchClose={() => setShowSearch(false)}
                    keybindings={{ search: true, selectAll: true, copy: true, paste: true }}
                    trailingRowOptions={trailingRowOptions || {
                        hint: "Adicionar nova linha...",
                        sticky: true,
                        tint: true,
                    }}
                    {...rest}
                />
            </div>
        </div>
    );
}


