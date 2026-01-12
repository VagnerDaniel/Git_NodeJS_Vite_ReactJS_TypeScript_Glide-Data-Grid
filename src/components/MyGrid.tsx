import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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

    const [rowsData, setRowsData] = useState<GridDataRecord[]>(initialData || []);
    const [isLocked, setIsLocked] = useState(!isEditableProp);
    const [sortState, setSortState] = useState<{ columnId?: string, direction: 'asc' | 'desc' } | undefined>();
    const [internalColumns, setInternalColumns] = useState<GridColumn[]>(columns);

    const [selection, setSelection] = useState<GridSelection>({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
    });

    // Sincroniza estado de edição quando a prop muda
    useEffect(() => {
        setIsLocked(!isEditableProp);
    }, [isEditableProp]);

    // Ordenação dos dados
    const sortedRows = useMemo(() => {
        if (!sortState) return rowsData;

        return [...rowsData].sort((a, b) => {
            const valA = a[sortState.columnId!];
            const valB = b[sortState.columnId!];

            if (valA === valB) return 0;
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;

            const multiplier = sortState.direction === "asc" ? 1 : -1;
            return valA < valB ? -1 * multiplier : 1 * multiplier;
        });
    }, [rowsData, sortState]);

    const onHeaderClicked = useCallback((colIndex: number) => {
        const columnId = internalColumns[colIndex].id as string;
        setSortState(prev => {
            if (prev?.columnId === columnId) {
                if (prev.direction === "asc") return { columnId, direction: "desc" };
                return undefined;
            }
            return { columnId, direction: "asc" };
        });
    }, [internalColumns]);

    // Atualiza indicadores visuais nas colunas
    const displayColumns = useMemo(() => {
        return internalColumns.map(c => {
            if (sortState && c.id === sortState.columnId) {
                return {
                    ...c,
                    title: `${c.title} ${sortState.direction === "asc" ? "↑" : "↓"}`
                };
            }
            return c;
        });
    }, [internalColumns, sortState]);

    const getCellContent = useCallback(([col, row]: Item): GridCell => {
        const column = internalColumns[col];
        const columnId = column.id as string;
        const rowData = sortedRows[row];
        const value = rowData ? rowData[columnId] : undefined;

        const isColEditable = editableColumns[columnId] !== false;
        const canEdit = !isLocked && isColEditable;

        // Log para depurar por que uma célula não edita (usar com cautela para não poluir)
        // if (row === 0) console.log(`Célula [${col},${row}] (${columnId}) - canEdit: ${canEdit}`);

        if (typeof value === "boolean" || columnId === "ativo") {
            return {
                kind: GridCellKind.Boolean,
                data: Boolean(value),
                allowOverlay: false, // Booleano não usa overlay
                readonly: !canEdit,
            };
        }

        if (typeof value === "number" || columnId === "idade" || columnId === "progresso") {
            return {
                kind: GridCellKind.Number,
                data: value !== undefined ? Number(value) : 0,
                displayData: columnId === "progresso" ? `${value}%` : String(value || 0),
                allowOverlay: canEdit,
                readonly: !canEdit,
            };
        }

        return {
            kind: GridCellKind.Text,
            data: String(value || ""),
            displayData: String(value || ""),
            allowOverlay: canEdit,
            readonly: !canEdit,
        } as TextCell;
    }, [sortedRows, isLocked, internalColumns, editableColumns]);

    const onCellEdited = useCallback(([col, row]: Item, newValue: GridCell) => {
        const columnId = internalColumns[col].id as string;

        let finalValue: any;
        if (newValue.kind === GridCellKind.Text ||
            newValue.kind === GridCellKind.Number ||
            newValue.kind === GridCellKind.Boolean) {
            finalValue = (newValue as any).data;
        } else {
            console.warn("Tipo de célula não suportado para edição:", newValue.kind);
            return;
        }

        console.log(`✅ Editando: [${col},${row}] ${columnId} ->`, finalValue);

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
        console.log(`Movendo coluna de ${from} para ${to}`);
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

    const containerRef = useRef<HTMLDivElement>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, colIndex: number, bounds: { x: number, y: number, width: number, height: number } } | undefined>();
    const [renameModal, setRenameModal] = useState<{ colIndex: number, title: string, x: number, y: number, width: number, height: number } | undefined>();

    const onHeaderContextMenu = useCallback((colIndex: number, event: any) => {
        event.preventDefault();

        // Tenta capturar de várias fontes possíveis para garantir que não seja 0,0
        const x = event.localEvent?.clientX ?? event.clientX ?? 0;
        const y = event.localEvent?.clientY ?? event.clientY ?? 0;

        setMenuConfig({
            x,
            y,
            colIndex,
            bounds: event.bounds
        });
    }, []);

    const addColumn = useCallback(() => {
        if (!menuConfig) return;
        const newId = `col_${Date.now()}`;
        const newCol: GridColumn = {
            id: newId,
            title: "Nova Coluna",
            width: 150
        };

        const newCols = [...internalColumns];
        newCols.splice(menuConfig.colIndex + 1, 0, newCol);
        setInternalColumns(newCols);
        setMenuConfig(undefined);
    }, [menuConfig, internalColumns]);

    const removeColumn = useCallback(() => {
        if (!menuConfig) return;
        const colToRemove = internalColumns[menuConfig.colIndex];

        // Proteção para não remover a coluna ID
        if (colToRemove.id === "id") {
            alert("A coluna ID não pode ser removida.");
            setMenuConfig(undefined);
            return;
        }

        const newCols = internalColumns.filter((_, i) => i !== menuConfig.colIndex);
        setInternalColumns(newCols);
        setMenuConfig(undefined);
    }, [menuConfig, internalColumns]);

    const renameColumn = useCallback(() => {
        if (!menuConfig || !containerRef.current) return;
        const col = internalColumns[menuConfig.colIndex];

        if (col.id === "id") {
            alert("A coluna ID não pode ser renomeada.");
            setMenuConfig(undefined);
            return;
        }

        const { bounds } = menuConfig;

        // O cabeçalho está sempre no topo do grid-wrapper
        setRenameModal({
            colIndex: menuConfig.colIndex,
            title: col.title,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        });
        setMenuConfig(undefined);
    }, [menuConfig, internalColumns]);

    const confirmRename = (newName: string) => {
        if (renameModal && newName.trim() !== "") {
            const newCols = [...internalColumns];
            newCols[renameModal.colIndex] = { ...newCols[renameModal.colIndex], title: newName.trim() };
            setInternalColumns(newCols);
        }
        setRenameModal(undefined);
    };

    return (
        <div className="grid-container" onClick={() => setMenuConfig(undefined)}>
            <div className="grid-controls">
                <div className="left-controls">
                    <button
                        className={`btn-toggle ${!isLocked ? 'active' : ''}`}
                        onClick={() => setIsLocked(v => !v)}
                    >
                        {isLocked ? "🔒 Editar" : lockButtonTitle || "🔓 Bloquear"}
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

            <div className="grid-wrapper" ref={containerRef}>
                <DataEditor
                    {...rest}
                    width="100%"
                    height="100%"
                    columns={displayColumns}
                    getCellContent={getCellContent}
                    rows={rowsData.length}
                    onHeaderClicked={onHeaderClicked}
                    onHeaderContextMenu={onHeaderContextMenu}
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
                />
            </div>

            {menuConfig && (
                <div
                    className="context-menu"
                    style={{ top: menuConfig.y, left: menuConfig.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={addColumn}>➕ Adicionar Coluna</button>
                    <button onClick={renameColumn}>✏️ Renomear Coluna</button>
                    <button onClick={removeColumn}>🗑️ Excluir Coluna</button>
                    <hr style={{ border: '0.1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />
                    <button onClick={() => setMenuConfig(undefined)}>❌ Fechar</button>
                </div>
            )}

            {renameModal && (
                <div className="inline-editor-overlay" onClick={() => setRenameModal(undefined)}>
                    <input
                        autoFocus
                        type="text"
                        className="inline-header-input"
                        style={{
                            top: renameModal.y,
                            left: renameModal.x,
                            width: renameModal.width,
                            height: renameModal.height
                        }}
                        defaultValue={renameModal.title}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => {
                            if (e.key === 'Enter') confirmRename(e.currentTarget.value);
                            if (e.key === 'Escape') setRenameModal(undefined);
                        }}
                        onBlur={e => confirmRename(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}


