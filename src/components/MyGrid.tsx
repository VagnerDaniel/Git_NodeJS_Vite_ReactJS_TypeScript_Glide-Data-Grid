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
    type DrawCellCallback,
    type DrawHeaderCallback,
} from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";
import ContextMenu from "./ContextMenu";

// Interface para os dados do Grid (exemplo padrão)
export interface GridDataRecord {
    id: number;
    [key: string]: any;
}

/** Interface para customização de cores do grid */
export interface GridColors {
    /** Cor de fundo do grid (área vazia) */
    bgGrid?: string;
    /** Cor de fundo das células com dados */
    bgCell?: string;
    /** Cor das bordas horizontais da matriz de dados */
    borderHorizontal?: string;
    /** Cor das bordas verticais da matriz de dados */
    borderVertical?: string;
    /** Cor das bordas do header */
    borderHeader?: string;
    /** Cor das bordas do identificador de linha (row marker) */
    borderRowMarker?: string;
}

// Cores padrão removidas para respeitar a governança do CSS

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
    /** Habilita o menu de contexto do header (colunas) - padrão: true */
    enableColumnContextMenu?: boolean;
    /** Habilita o menu de contexto das linhas - padrão: true */
    enableRowContextMenu?: boolean;
    /** Customização de cores do grid */
    gridColors?: GridColors;
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
        enableColumnContextMenu = true,
        enableRowContextMenu = true,
        gridColors: gridColorsProp,
        // Repassar as demais props do DataEditor
        rowMarkers = "both",
        smoothScrollX = true,
        smoothScrollY = true,
        getCellsForSelection = true,
        onRowAppended: onRowAppendedProp,
        trailingRowOptions,
        ...rest
    } = props;

    // Estado para capturar as cores que "governam" o grid via CSS
    const [cssColors, setCssColors] = useState<GridColors>({});

    useEffect(() => {
        const style = getComputedStyle(document.documentElement);
        const getV = (name: string) => style.getPropertyValue(name).trim() || undefined;

        setCssColors({
            bgGrid: getV("--gdg-bg-grid"),
            bgCell: getV("--gdg-bg-cell"),
            borderHorizontal: getV("--gdg-border-hor"),
            borderVertical: getV("--gdg-border-ver"),
            borderHeader: getV("--gdg-border-header"),
            borderRowMarker: getV("--gdg-border-row-marker"),
        });
    }, []);

    // Merge das cores: CSS (base) + Props (sobrescrita)
    const gridColors = { ...cssColors, ...gridColorsProp };

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
    const [rowMenuConfig, setRowMenuConfig] = useState<{ x: number, y: number, rowIndex: number } | undefined>();
    const [renameModal, setRenameModal] = useState<{ colIndex: number, title: string, x: number, y: number, width: number, height: number } | undefined>();

    // Largura e altura estimadas do menu de contexto para cálculo de posicionamento
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 180;
    const ROW_MENU_HEIGHT = 200;

    const onHeaderContextMenu = useCallback((colIndex: number, event: any) => {
        // Verifica se o menu de contexto de coluna está habilitado
        if (!enableColumnContextMenu) return;

        event.preventDefault();

        // Usa os bounds do header da coluna para posicionar o menu corretamente
        const bounds = event.bounds;

        // Posição inicial: logo abaixo do header, alinhado à esquerda da coluna
        let x = bounds.x;
        let y = bounds.y + bounds.height;

        // Obtém as dimensões da viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Ajusta se o menu ultrapassar a borda direita da tela
        if (x + MENU_WIDTH > viewportWidth) {
            x = viewportWidth - MENU_WIDTH - 10; // 10px de margem
        }

        // Ajusta se o menu ultrapassar a borda inferior da tela
        if (y + MENU_HEIGHT > viewportHeight) {
            y = bounds.y - MENU_HEIGHT; // Abre acima do header
        }

        // Garante que não fique com coordenadas negativas
        x = Math.max(10, x);
        y = Math.max(10, y);

        setMenuConfig({
            x,
            y,
            colIndex,
            bounds: event.bounds
        });
    }, [enableColumnContextMenu]);

    // Handler para menu de contexto de linha (clique direito na numeração)
    const onCellContextMenu = useCallback(([col, row]: Item, event: any) => {
        // col === -1 significa que clicou no row marker (numeração da linha)
        if (col !== -1) return;

        // Verifica se o menu de contexto de linha está habilitado
        if (!enableRowContextMenu) return;

        event.preventDefault();

        const bounds = event.bounds;

        // Posição inicial: ao lado direito do row marker
        let x = bounds.x + bounds.width;
        let y = bounds.y;

        // Obtém as dimensões da viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Ajusta se o menu ultrapassar a borda direita da tela
        if (x + MENU_WIDTH > viewportWidth) {
            x = viewportWidth - MENU_WIDTH - 10;
        }

        // Ajusta se o menu ultrapassar a borda inferior da tela
        // Usa uma margem extra de segurança (20px) para garantir visibilidade
        if (y + ROW_MENU_HEIGHT > viewportHeight - 20) {
            // Posiciona o menu acima do ponto de clique, subtraindo a altura do menu
            y = bounds.y - ROW_MENU_HEIGHT + bounds.height;

            // Se ainda ultrapassar o topo, centraliza na viewport
            if (y < 10) {
                y = Math.max(10, viewportHeight - ROW_MENU_HEIGHT - 20);
            }
        }

        // Garante que não fique com coordenadas negativas
        x = Math.max(10, x);
        y = Math.max(10, y);

        // Fecha o menu de coluna se estiver aberto e abre o menu de linha
        setMenuConfig(undefined);
        setRowMenuConfig({ x, y, rowIndex: row });
    }, [enableRowContextMenu]);

    // Funções para manipulação de linhas
    const addRowAbove = useCallback(() => {
        if (!rowMenuConfig) return;
        const newRecord: GridDataRecord = {
            id: Date.now(),
        };
        internalColumns.forEach(c => {
            if (c.id && c.id !== "id") {
                newRecord[c.id as string] = c.id === "ativo" ? false : (c.id === "idade" || c.id === "progresso" ? 0 : "");
            }
        });

        const newData = [...rowsData];
        newData.splice(rowMenuConfig.rowIndex, 0, newRecord);
        setRowsData(newData);
        if (onDataChange) onDataChange(newData);
        setRowMenuConfig(undefined);
    }, [rowMenuConfig, rowsData, internalColumns, onDataChange]);

    const addRowBelow = useCallback(() => {
        if (!rowMenuConfig) return;
        const newRecord: GridDataRecord = {
            id: Date.now(),
        };
        internalColumns.forEach(c => {
            if (c.id && c.id !== "id") {
                newRecord[c.id as string] = c.id === "ativo" ? false : (c.id === "idade" || c.id === "progresso" ? 0 : "");
            }
        });

        const newData = [...rowsData];
        newData.splice(rowMenuConfig.rowIndex + 1, 0, newRecord);
        setRowsData(newData);
        if (onDataChange) onDataChange(newData);
        setRowMenuConfig(undefined);
    }, [rowMenuConfig, rowsData, internalColumns, onDataChange]);

    const deleteRow = useCallback(() => {
        if (!rowMenuConfig) return;
        if (rowsData.length <= 1) {
            alert("Não é possível excluir a última linha.");
            setRowMenuConfig(undefined);
            return;
        }

        const newData = rowsData.filter((_, i) => i !== rowMenuConfig.rowIndex);
        setRowsData(newData);
        if (onDataChange) onDataChange(newData);
        setRowMenuConfig(undefined);
    }, [rowMenuConfig, rowsData, onDataChange]);

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

    // Callback para customizar o desenho das células
    // Remove bordas de células que estão fora da matriz de dados
    const drawCell: DrawCellCallback = useCallback((args, drawContent) => {
        const { ctx, rect, row, col, theme } = args;

        // Se a célula está dentro dos dados (matriz de dados), aplica fundo e bordas customizadas
        if (row < rowsData.length && col >= 0 && col < internalColumns.length) {
            // Desenha o fundo primeiro usando a cor do TEMA (governada pelo CSS/Props)
            ctx.save();
            ctx.fillStyle = theme.bgCell ?? "transparent";
            // Para todas as linhas, desenha o fundo normalmente
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            // ESPECIAL: Para a primeira linha, desenha uma pequena faixa da cor da borda do header 
            // no topo para garantir que não haja frestas
            if (row === 0) {
                ctx.fillStyle = theme.borderColor ?? "transparent";
                //  ctx.fillRect(rect.x, rect.y - 2, rect.width, 5);
            }
            ctx.restore();

            // Desenha o conteúdo padrão da célula
            drawContent();

            // Desenha bordas por cima usando as cores do TEMA
            ctx.lineWidth = 1;

            // Borda direita (vertical)
            ctx.strokeStyle = theme.borderColor ?? "transparent";
            ctx.beginPath();
            ctx.moveTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            ctx.stroke();

            // Borda inferior (horizontal)
            ctx.strokeStyle = theme.horizontalBorderColor ?? "transparent";
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y + rect.height);
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            ctx.stroke();

            return true;
        } else {
            // Célula fora da matriz de dados - preenche com cor de fundo do grid (bgCellMedium no tema)
            ctx.fillStyle = theme.bgCellMedium ?? "transparent";
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            return true;
        }
    }, [rowsData.length, internalColumns.length]);

    // Callback para customizar o desenho do header (bordas)
    const drawHeader: DrawHeaderCallback = useCallback((args, drawContent) => {
        const { ctx, rect, theme } = args;

        // Desenha o conteúdo padrão do header
        drawContent();

        // Desenha bordas customizadas no header usando o tema
        ctx.strokeStyle = theme.borderColor ?? "transparent";
        ctx.lineWidth = 1;

        // Borda direita
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.width, rect.y);
        ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
        ctx.stroke();

        // Borda inferior
        ctx.fillStyle = theme.borderColor ?? "transparent";
        ctx.fillRect(rect.x, rect.y + rect.height - 2, rect.width, 2);

        return true;
    }, []);

    return (
        <div className="grid-container" onClick={() => { setMenuConfig(undefined); setRowMenuConfig(undefined); }}>
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
                    onCellContextMenu={onCellContextMenu}
                    drawCell={drawCell}
                    drawHeader={drawHeader}
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
                    // Configuração de tema - bordas transparentes para que drawCell controle
                    // Usa bgGrid como fundo padrão (row marker e células fora da matriz)
                    // O drawCell vai desenhar bgCell apenas nas células da matriz de dados
                    theme={{
                        // Mapeamos as cores que vem do CSS para as chaves do tema do Glide
                        bgCell: gridColors.bgCell,
                        bgCellMedium: gridColors.bgGrid, // Usado para o fundo vazio
                        horizontalBorderColor: gridColors.borderHorizontal,
                        borderColor: gridColors.borderVertical,
                        bgHeaderHasFocus: gridColors.borderRowMarker,
                        // Mantemos cores de texto neutras se não vierem do CSS
                        textDark: "#000000",
                        textMedium: "#333333",
                        textLight: "#666666",
                    }}
                    // Não desenha células além dos dados
                    experimental={{
                        strict: true,
                    }}
                />
            </div>

            {menuConfig && (
                <ContextMenu
                    x={menuConfig.x}
                    y={menuConfig.y}
                    onClose={() => setMenuConfig(undefined)}
                    items={[
                        { label: "Adicionar Coluna", icon: "➕", onClick: addColumn },
                        { label: "Renomear Coluna", icon: "✏️", onClick: renameColumn },
                        { label: "Excluir Coluna", icon: "🗑️", onClick: removeColumn },
                    ]}
                />
            )}

            {rowMenuConfig && (
                <ContextMenu
                    x={rowMenuConfig.x}
                    y={rowMenuConfig.y}
                    onClose={() => setRowMenuConfig(undefined)}
                    items={[
                        { label: "Adicionar Linha Acima", icon: "⬆️", onClick: addRowAbove },
                        { label: "Adicionar Linha Abaixo", icon: "⬇️", onClick: addRowBelow, dividerAfter: true },
                        { label: "Excluir Linha", icon: "🗑️", onClick: deleteRow },
                    ]}
                />
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


