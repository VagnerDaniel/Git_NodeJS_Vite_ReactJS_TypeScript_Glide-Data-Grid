import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
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

import GlideGridCore from "./GlideGridCore";
import ContextMenu from "./ContextMenu";

// Interface para os dados do Grid (exemplo padrao)
export interface GridDataRecord {
    id: number;
    [key: string]: any;
}

/** Interface para customizacao de cores do grid */
export interface GridColors {
    /** Cor de fundo do grid (area vazia) */
    bgGrid?: string;
    /** Cor de fundo das celulas com dados */
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

export type GridPreset = "default" | "compact" | "readOnly" | "audit";

export interface FeatureFlags {
    selection?: boolean;
    search?: SearchConfig;
    editing?: boolean;
    sorting?: boolean;
    columnReorder?: boolean;
    columnResize?: boolean;
    rowAppend?: boolean;
    columnMenu?: boolean;
    rowMenu?: boolean;
    stats?: boolean;
    locking?: boolean;
}

export type SearchAnimation = "slide-left" | "slide-top" | "blur" | "show";

export type SearchOffset = `${number}px` | `${number}rem` | `${number}%`;

export interface SearchConfig {
    active?: boolean;
    animation?: SearchAnimation;
    offsetX?: SearchOffset;
    offsetY?: SearchOffset;
}

interface PresetConfig {
    features: Required<FeatureFlags>;
    dataEditor: Partial<DataEditorProps>;
}

interface MyGlideGridProps extends Partial<DataEditorProps> {
    /** Preset de configuracao */
    preset?: GridPreset;
    /** Flags de funcionalidades por dominio */
    features?: FeatureFlags;
    /** Escape hatch para props do DataEditor */
    dataEditorProps?: Partial<DataEditorProps>;
    /** Dados iniciais da grade */
    initialData?: GridDataRecord[];
    /** Configuracao de colunas */
    columns: GridColumn[];
    /** Define se a edicao esta habilitada globalmente */
    isEditable?: boolean;
    /** Mapeamento de colunas que podem ser editadas */
    editableColumns?: Record<string, boolean>;
    /** Mostrar contador de registros no topo */
    showStats?: boolean;
    /** Titulo customizado para o botao de trava */
    lockButtonTitle?: string;
    /** Callback disparado quando os dados mudam internamente */
    onDataChange?: (newData: GridDataRecord[]) => void;
    /** Habilita o menu de contexto do header (colunas) - padrao: true */
    enableColumnContextMenu?: boolean;
    /** Habilita o menu de contexto das linhas - padrao: true */
    enableRowContextMenu?: boolean;
    /** Customizacao de cores do grid */
    gridColors?: GridColors;
}

const DEFAULT_EDITABLE_COLUMNS: Record<string, boolean> = {};
const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const SEARCH_DEFAULT_OFFSET_X = 20;
const SEARCH_DEFAULT_OFFSET_Y = 0;
const resolveOffset = (value: SearchOffset | undefined, reference: number, fallback: number): number => {
    if (value === undefined) return fallback;
    const raw = value.trim();
    if (raw.endsWith("%")) {
        const percent = Number.parseFloat(raw);
        if (Number.isNaN(percent)) return fallback;
        return (reference * percent) / 100;
    }
    if (raw.endsWith("rem")) {
        const rem = Number.parseFloat(raw);
        if (Number.isNaN(rem)) return fallback;
        const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return rem * rootSize;
    }
    if (raw.endsWith("px")) {
        const px = Number.parseFloat(raw);
        return Number.isNaN(px) ? fallback : px;
    }
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const PRESET_CONFIGS: Record<GridPreset, PresetConfig> = {
    default: {
        features: {
            selection: true,
            search: { active: true, animation: "slide-left" },
            editing: true,
            sorting: true,
            columnReorder: true,
            columnResize: true,
            rowAppend: true,
            columnMenu: true,
            rowMenu: true,
            stats: true,
            locking: true,
        },
        dataEditor: {
            rowMarkers: "both",
            smoothScrollX: true,
            smoothScrollY: true,
            rangeSelect: "multi-rect",
            columnSelect: "multi",
            rowSelect: "multi",
        },
    },
    compact: {
        features: {
            selection: true,
            search: { active: false },
            editing: true,
            sorting: true,
            columnReorder: true,
            columnResize: true,
            rowAppend: false,
            columnMenu: true,
            rowMenu: true,
            stats: false,
            locking: false,
        },
        dataEditor: {
            rowMarkers: "both",
            headerHeight: 32,
            rowHeight: 30,
        },
    },
    readOnly: {
        features: {
            selection: true,
            search: { active: true, animation: "slide-left" },
            editing: false,
            sorting: true,
            columnReorder: false,
            columnResize: false,
            rowAppend: false,
            columnMenu: false,
            rowMenu: false,
            stats: true,
            locking: false,
        },
        dataEditor: {
            rowMarkers: "number",
        },
    },
    audit: {
        features: {
            selection: true,
            search: { active: true, animation: "slide-left" },
            editing: false,
            sorting: true,
            columnReorder: false,
            columnResize: false,
            rowAppend: false,
            columnMenu: true,
            rowMenu: false,
            stats: true,
            locking: false,
        },
        dataEditor: {
            rowMarkers: "number",
        },
    },
};

const MyGlideGrid = (props: MyGlideGridProps) => {
    const {
        preset = "default",
        features: featuresProp,
        dataEditorProps,
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
        gridSelection: gridSelectionProp,
        onGridSelectionChange: onGridSelectionChangeProp,
        showSearch: showSearchProp,
        onSearchClose: onSearchCloseProp,
        onCellClicked: onCellClickedProp,
        onCellActivated: onCellActivatedProp,
        keybindings: keybindingsProp,
        experimental: experimentalProp,
        theme: themeProp,
        rowMarkers: rowMarkersProp,
        smoothScrollX: smoothScrollXProp,
        smoothScrollY: smoothScrollYProp,
        getCellsForSelection: getCellsForSelectionProp,
        onRowAppended: onRowAppendedProp,
        trailingRowOptions: trailingRowOptionsProp,
        rangeSelect: rangeSelectProp,
        columnSelect: columnSelectProp,
        rowSelect: rowSelectProp,
        ...rest
    } = props;

    const presetConfig = PRESET_CONFIGS[preset];
    const { search: featureSearchConfig, ...featureRest } = featuresProp ?? {};
    const searchConfig = featureSearchConfig ?? presetConfig.features.search;
    const searchEnabled = searchConfig?.active ?? false;
    const effectiveFeatures: Required<FeatureFlags> = {
        ...presetConfig.features,
        ...featureRest,
        search: searchConfig,
    };

    const selectionEnabled = effectiveFeatures.selection;
    const editingEnabled = effectiveFeatures.editing;
    const sortingEnabled = effectiveFeatures.sorting;
    const columnReorderEnabled = effectiveFeatures.columnReorder;
    const columnResizeEnabled = effectiveFeatures.columnResize;
    const rowAppendEnabled = effectiveFeatures.rowAppend && editingEnabled;
    const columnMenuEnabled = effectiveFeatures.columnMenu && enableColumnContextMenu && editingEnabled;
    const rowMenuEnabled = effectiveFeatures.rowMenu && enableRowContextMenu && editingEnabled;
    const statsEnabled = effectiveFeatures.stats && showStats;
    const lockingEnabled = effectiveFeatures.locking && editingEnabled;

    const dataEditorDefaults = presetConfig.dataEditor;
    const rowMarkers = rowMarkersProp ?? dataEditorProps?.rowMarkers ?? dataEditorDefaults.rowMarkers ?? "both";
    const smoothScrollX = smoothScrollXProp ?? dataEditorProps?.smoothScrollX ?? dataEditorDefaults.smoothScrollX ?? true;
    const smoothScrollY = smoothScrollYProp ?? dataEditorProps?.smoothScrollY ?? dataEditorDefaults.smoothScrollY ?? true;
    const rangeSelect = selectionEnabled
        ? (rangeSelectProp ?? dataEditorProps?.rangeSelect ?? dataEditorDefaults.rangeSelect ?? "multi-rect")
        : "none";
    const columnSelect = selectionEnabled
        ? (columnSelectProp ?? dataEditorProps?.columnSelect ?? dataEditorDefaults.columnSelect ?? "multi")
        : "none";
    const rowSelect = selectionEnabled
        ? (rowSelectProp ?? dataEditorProps?.rowSelect ?? dataEditorDefaults.rowSelect ?? "multi")
        : "none";
    const getCellsForSelection = selectionEnabled
        ? (getCellsForSelectionProp ?? dataEditorProps?.getCellsForSelection ?? true)
        : false;

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
    const [sortState, setSortState] = useState<{ columnId?: string, direction: "asc" | "desc" } | undefined>();
    const [internalColumns, setInternalColumns] = useState<GridColumn[]>(columns);

    const [selection, setSelection] = useState<GridSelection>({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
    });

    useEffect(() => {
        setInternalColumns(columns);
    }, [columns]);

    // Sincroniza estado de edicao quando a prop muda
    useEffect(() => {
        setIsLocked(editingEnabled ? !isEditableProp : true);
    }, [editingEnabled, isEditableProp]);

    useEffect(() => {
        if (!selectionEnabled) {
            setSelection({
                columns: CompactSelection.empty(),
                rows: CompactSelection.empty(),
            });
        }
    }, [selectionEnabled]);

    const showSearchEffectiveProp = showSearchProp ?? dataEditorProps?.showSearch;
    const searchAnimation = searchConfig?.animation ?? "slide-left";
    const searchOffsetX = searchConfig?.offsetX;
    const searchOffsetY = searchConfig?.offsetY;
    const onSearchCloseEffectiveProp = onSearchCloseProp ?? dataEditorProps?.onSearchClose;
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (!searchEnabled) {
            setShowSearch(false);
            return;
        }
        if (showSearchEffectiveProp !== undefined) {
            setShowSearch(showSearchEffectiveProp);
        }
    }, [showSearchEffectiveProp, searchEnabled]);

    useEffect(() => {
        if (!searchEnabled || !showSearch) return;

        const container = containerRef.current;
        if (!container) return;

        const searchInner = container.querySelector(".gdg-search-bar-inner") as HTMLElement | null;
        const wrapper = searchInner?.parentElement as HTMLElement | null;

        if (!searchInner || !wrapper) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let originLeft = 0;
        let originTop = 0;
        let maxLeft = 0;
        let maxTop = 0;

        const applyPosition = (left: number, top: number, disableAnimation = true, mode: "absolute" | "fixed" = "absolute") => {
            wrapper.style.position = mode;
            wrapper.style.left = `${left}px`;
            wrapper.style.top = `${top}px`;
            wrapper.style.right = "auto";
            wrapper.style.animation = disableAnimation ? "none" : "";
            wrapper.style.transform = "translateX(0)";
        };

        const applyAnimation = () => {
            wrapper.classList.remove(
                "gdg-search-anim-slide-left",
                "gdg-search-anim-slide-top",
                "gdg-search-anim-blur",
                "gdg-search-anim-show"
            );
            wrapper.classList.add(`gdg-search-anim-${searchAnimation}`);
        };

        const ensureInitialPosition = () => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();
            const maxLeftLocal = Math.max(0, cRect.width - wrapperRect.width);
            const maxTopLocal = Math.max(0, cRect.height - wrapperRect.height);
            const offsetX = resolveOffset(searchOffsetX, cRect.width, SEARCH_DEFAULT_OFFSET_X);
            const offsetY = resolveOffset(searchOffsetY, cRect.height, SEARCH_DEFAULT_OFFSET_Y);
            const left = clampValue(maxLeftLocal - offsetX, 0, maxLeftLocal);
            const top = clampValue(offsetY, 0, maxTopLocal);
            applyPosition(left, top, false, "absolute");
        };

        applyAnimation();
        ensureInitialPosition();

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (!target.closest(".gdg-search-drag-handle")) return;

            const wrapperRect = wrapper.getBoundingClientRect();

            originLeft = wrapperRect.left;
            originTop = wrapperRect.top;

            maxLeft = Math.max(0, window.innerWidth - wrapperRect.width);
            maxTop = Math.max(0, window.innerHeight - wrapperRect.height);

            startX = event.clientX;
            startY = event.clientY;
            dragging = true;

            wrapper.style.cursor = "move";
            wrapper.style.position = "fixed";
            (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId);
            event.preventDefault();
        };

        const onPointerMove = (event: PointerEvent) => {
            if (!dragging) return;
            const nextLeft = clampValue(originLeft + (event.clientX - startX), 0, maxLeft);
            const nextTop = clampValue(originTop + (event.clientY - startY), 0, maxTop);
            applyPosition(nextLeft, nextTop, true, "fixed");
        };

        const onPointerUp = (event: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId);
        };

        const onWindowBlur = () => {
            dragging = false;
        };

        let handle = searchInner.querySelector(".gdg-search-drag-handle") as HTMLDivElement | null;
        if (!handle) {
            handle = document.createElement("div");
            handle.className = "gdg-search-drag-handle";
            handle.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 6h2v2H9V6zm4 0h2v2h-2V6zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zM9 16h2v2H9v-2zm4 0h2v2h-2v-2z" fill="currentColor" />
                </svg>
            `;
            searchInner.insertBefore(handle, searchInner.firstChild);
        }

        handle.addEventListener("pointerdown", onPointerDown);
        handle.addEventListener("pointermove", onPointerMove);
        handle.addEventListener("pointerup", onPointerUp);
        handle.addEventListener("pointercancel", onPointerUp);
        window.addEventListener("blur", onWindowBlur);

        return () => {
            handle?.removeEventListener("pointerdown", onPointerDown);
            handle?.removeEventListener("pointermove", onPointerMove);
            handle?.removeEventListener("pointerup", onPointerUp);
            handle?.removeEventListener("pointercancel", onPointerUp);
            window.removeEventListener("blur", onWindowBlur);
            wrapper.style.cursor = "";
        };
    }, [searchAnimation, searchEnabled, searchOffsetX, searchOffsetY, showSearch]);

    useEffect(() => {
        const onWindowScroll = () => {
            document.body.classList.add("gdg-hide-overlay");
        };

        window.addEventListener("scroll", onWindowScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onWindowScroll);
            document.body.classList.remove("gdg-hide-overlay");
        };
    }, []);

    // Ordenacao dos dados
    const sortedRows = useMemo(() => {
        if (!sortingEnabled || !sortState) return rowsData;

        return [...rowsData].sort((a, b) => {
            const valA = a[sortState.columnId!];
            const valB = b[sortState.columnId!];

            if (valA === valB) return 0;
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;

            const multiplier = sortState.direction === "asc" ? 1 : -1;
            return valA < valB ? -1 * multiplier : 1 * multiplier;
        });
    }, [rowsData, sortState, sortingEnabled]);

    const onHeaderClicked = useCallback((colIndex: number) => {
        if (!sortingEnabled) return;

        const columnId = internalColumns[colIndex].id as string;
        setSortState(prev => {
            if (prev?.columnId === columnId) {
                if (prev.direction === "asc") return { columnId, direction: "desc" };
                return undefined;
            }
            return { columnId, direction: "asc" };
        });
    }, [internalColumns, sortingEnabled]);

    // Atualiza indicadores visuais nas colunas
    const displayColumns = useMemo(() => {
        if (!sortingEnabled || !sortState) return internalColumns;

        return internalColumns.map(c => {
            if (c.id === sortState.columnId) {
                return {
                    ...c,
                    title: `${c.title} ${sortState.direction === "asc" ? "^" : "v"}`
                };
            }
            return c;
        });
    }, [internalColumns, sortState, sortingEnabled]);

    const getCellContent = useCallback(([col, row]: Item): GridCell => {
        const column = internalColumns[col];
        const columnId = column.id as string;
        const rowData = sortedRows[row];
        const value = rowData ? rowData[columnId] : undefined;

        const isColEditable = editableColumns[columnId] !== false;
        const canEdit = editingEnabled && !isLocked && isColEditable;

        if (typeof value === "boolean" || columnId === "ativo") {
            return {
                kind: GridCellKind.Boolean,
                data: Boolean(value),
                allowOverlay: false, // Booleano nao usa overlay
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
    }, [sortedRows, isLocked, internalColumns, editableColumns, editingEnabled]);

    const onCellEdited = useCallback(([col, row]: Item, newValue: GridCell) => {
        if (!editingEnabled) return;

        const columnId = internalColumns[col].id as string;

        let finalValue: any;
        if (newValue.kind === GridCellKind.Text ||
            newValue.kind === GridCellKind.Number ||
            newValue.kind === GridCellKind.Boolean) {
            finalValue = (newValue as any).data;
        } else {
            console.warn("Tipo de celula nao suportado para edicao:", newValue.kind);
            return;
        }

        console.log(`Editando: [${col},${row}] ${columnId} ->`, finalValue);

        setRowsData(prev => {
            const newData = [...prev];
            newData[row] = {
                ...newData[row],
                [columnId]: finalValue
            };
            if (onDataChange) onDataChange(newData);
            return newData;
        });
    }, [internalColumns, onDataChange, editingEnabled]);

    const onSelectionChange = useCallback((newSelection: GridSelection) => {
        if (!selectionEnabled) return;
        if (onGridSelectionChangeProp) {
            onGridSelectionChangeProp(newSelection);
        }
        if (gridSelectionProp === undefined) {
            setSelection(newSelection);
        }
    }, [gridSelectionProp, onGridSelectionChangeProp, selectionEnabled]);

    const handleRowAppended = useCallback(() => {
        if (!rowAppendEnabled) return;

        if (onRowAppendedProp) {
            onRowAppendedProp();
            return;
        }

        const newRecord: GridDataRecord = {
            id: rowsData.length + 1,
        };
        internalColumns.forEach(c => {
            if (c.id && c.id !== "id") {
                // Tenta inferir valor padrao pelo tipo
                newRecord[c.id as string] = c.id === "status" ? "Ativo" : (c.id === "idade" ? 0 : "");
            }
        });

        const newData = [...rowsData, newRecord];
        setRowsData(newData);
        if (onDataChange) onDataChange(newData);
    }, [rowAppendEnabled, rowsData, internalColumns, onRowAppendedProp, onDataChange]);

    const clearOverlayHide = useCallback(() => {
        document.body.classList.remove("gdg-hide-overlay");
    }, []);

    const handleCellClicked = useCallback((cell: Item, event: any) => {
        clearOverlayHide();
        onCellClickedProp?.(cell, event);
    }, [clearOverlayHide, onCellClickedProp]);

    const handleCellActivated = useCallback((cell: Item) => {
        clearOverlayHide();
        onCellActivatedProp?.(cell);
    }, [clearOverlayHide, onCellActivatedProp]);

    const onColumnMoved = useCallback((from: number, to: number) => {
        if (!columnReorderEnabled) return;
        console.log(`Movendo coluna de ${from} para ${to}`);
        setInternalColumns(prev => {
            const newCols = [...prev];
            const [moved] = newCols.splice(from, 1);
            newCols.splice(to, 0, moved);
            return newCols;
        });
    }, [columnReorderEnabled]);

    const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
        if (!columnResizeEnabled) return;
        setInternalColumns(prev => {
            return prev.map(c => c.id === column.id ? { ...c, width: newSize } : c);
        });
    }, [columnResizeEnabled]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, colIndex: number, bounds: { x: number, y: number, width: number, height: number } } | undefined>();
    const [rowMenuConfig, setRowMenuConfig] = useState<{ x: number, y: number, rowIndex: number } | undefined>();
    const [renameModal, setRenameModal] = useState<{ colIndex: number, title: string, x: number, y: number, width: number, height: number } | undefined>();

    // Largura e altura estimadas do menu de contexto para calculo de posicionamento
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 180;
    const ROW_MENU_HEIGHT = 200;

    const onHeaderContextMenu = useCallback((colIndex: number, event: any) => {
        if (!columnMenuEnabled) return;

        event.preventDefault();
        const bounds = event.bounds;

        let x = bounds.x;
        let y = bounds.y + bounds.height;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (x + MENU_WIDTH > viewportWidth) {
            x = viewportWidth - MENU_WIDTH - 10;
        }

        if (y + MENU_HEIGHT > viewportHeight) {
            y = bounds.y - MENU_HEIGHT;
        }

        x = Math.max(10, x);
        y = Math.max(10, y);

        setMenuConfig({
            x,
            y,
            colIndex,
            bounds: event.bounds
        });
    }, [columnMenuEnabled]);

    // Handler para menu de contexto de linha (clique direito na numeracao)
    const onCellContextMenu = useCallback(([col, row]: Item, event: any) => {
        if (!rowMenuEnabled) return;
        if (col !== -1) return;

        event.preventDefault();

        const bounds = event.bounds;

        let x = bounds.x + bounds.width;
        let y = bounds.y;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (x + MENU_WIDTH > viewportWidth) {
            x = viewportWidth - MENU_WIDTH - 10;
        }

        if (y + ROW_MENU_HEIGHT > viewportHeight - 20) {
            y = bounds.y - ROW_MENU_HEIGHT + bounds.height;

            if (y < 10) {
                y = Math.max(10, viewportHeight - ROW_MENU_HEIGHT - 20);
            }
        }

        x = Math.max(10, x);
        y = Math.max(10, y);

        setMenuConfig(undefined);
        setRowMenuConfig({ x, y, rowIndex: row });
    }, [rowMenuEnabled]);

    // Funcoes para manipulacao de linhas
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
            alert("Nao e possivel excluir a ultima linha.");
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

        if (colToRemove.id === "id") {
            alert("A coluna ID nao pode ser removida.");
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
            alert("A coluna ID nao pode ser renomeada.");
            setMenuConfig(undefined);
            return;
        }

        const { bounds } = menuConfig;

        // O cabecalho esta sempre no topo do grid-wrapper
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

    // Callback para customizar o desenho das celulas
    // Remove bordas de celulas que estao fora da matriz de dados
    const drawCell: DrawCellCallback = useCallback((args, drawContent) => {
        const { ctx, rect, row, col, theme } = args;

        if (row < rowsData.length && col >= 0 && col < internalColumns.length) {
            ctx.save();
            const baseFill = (args as { cellFillColor?: string }).cellFillColor ?? theme.bgCell ?? "transparent";
            const fillColor = (!searchEnabled || !showSearch) && !args.highlighted
                ? theme.bgCell ?? "transparent"
                : baseFill;
            ctx.fillStyle = fillColor;
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            if (row === 0) {
                ctx.fillStyle = theme.borderColor ?? "transparent";
            }
            ctx.restore();

            drawContent();

            ctx.lineWidth = 1;

            ctx.strokeStyle = theme.borderColor ?? "transparent";
            ctx.beginPath();
            ctx.moveTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            ctx.stroke();

            ctx.strokeStyle = theme.horizontalBorderColor ?? "transparent";
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y + rect.height);
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            ctx.stroke();

            return true;
        }

        ctx.fillStyle = theme.bgCellMedium ?? "transparent";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        return true;
    }, [rowsData.length, internalColumns.length]);

    // Callback para customizar o desenho do header (bordas)
    const drawHeader: DrawHeaderCallback = useCallback((args, drawContent) => {
        const { ctx, rect, theme } = args;

        drawContent();

        ctx.strokeStyle = theme.borderColor ?? "transparent";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(rect.x + rect.width, rect.y);
        ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
        ctx.stroke();

        ctx.fillStyle = theme.borderColor ?? "transparent";
        ctx.fillRect(rect.x, rect.y + rect.height - 2, rect.width, 2);

        return true;
    }, []);

    const themeColors = {
        bgCell: gridColors.bgCell ?? "#ffffff",
        bgGrid: gridColors.bgGrid ?? "#f5f5f5",
        borderHorizontal: gridColors.borderHorizontal ?? "rgba(0, 0, 0, 0.1)",
        borderVertical: gridColors.borderVertical ?? "rgba(0, 0, 0, 0.1)",
        borderHeader: gridColors.borderHeader ?? "rgba(0, 0, 0, 0.2)",
        borderRowMarker: gridColors.borderRowMarker ?? "rgba(0, 0, 0, 0.2)",
    };

    const trailingRowOptions = rowAppendEnabled ? (trailingRowOptionsProp ?? dataEditorProps?.trailingRowOptions ?? {
        hint: "Adicionar nova linha...",
        sticky: true,
        tint: true,
    }) : undefined;

    const mergedKeybindings = {
        search: searchEnabled,
        selectAll: true,
        copy: true,
        paste: true,
        ...keybindingsProp,
        ...dataEditorProps?.keybindings,
    };

    const mergedTheme = {
        bgCell: themeColors.bgCell,
        bgCellMedium: themeColors.bgGrid,
        horizontalBorderColor: themeColors.borderHorizontal,
        borderColor: themeColors.borderVertical,
        bgHeaderHasFocus: themeColors.borderRowMarker,
        textDark: "#000000",
        textMedium: "#333333",
        textLight: "#666666",
        ...themeProp,
        ...dataEditorProps?.theme,
    };

    const mergedExperimental = {
        strict: true,
        ...experimentalProp,
        ...dataEditorProps?.experimental,
    };

    const passThroughProps: Partial<DataEditorProps> = {
        ...dataEditorDefaults,
        ...rest,
        ...dataEditorProps,
    };

    const selectionToUse = selectionEnabled
        ? (gridSelectionProp ?? selection)
        : {
            columns: CompactSelection.empty(),
            rows: CompactSelection.empty(),
        };

    return (
        <div className="grid-container" onClick={() => { setMenuConfig(undefined); setRowMenuConfig(undefined); }}>
            <div className="grid-controls">
                <div className="left-controls">
                    {lockingEnabled && (
                        <button
                            className={`btn-toggle ${!isLocked ? "active" : ""}`}
                            onClick={() => setIsLocked(v => !v)}
                        >
                            {isLocked ? "Editar" : lockButtonTitle || "Bloquear"}
                        </button>
                    )}
                    {searchEnabled && (
                        <button
                            className="btn-toggle"
                            onClick={() => {
                                if (showSearchEffectiveProp === undefined) {
                                    setShowSearch(v => !v);
                                } else if (showSearchEffectiveProp) {
                                    onSearchCloseEffectiveProp?.();
                                }
                            }}
                        >
                            Buscar
                        </button>
                    )}
                </div>
                {statsEnabled && (
                    <span className="grid-stats">
                        Total de registros: <strong>{rowsData.length}</strong>
                    </span>
                )}
            </div>

            <div className="grid-wrapper" ref={containerRef}>
                <GlideGridCore
                    {...passThroughProps}
                    width="100%"
                    height="100%"
                    columns={displayColumns}
                    getCellContent={getCellContent}
                    rows={rowsData.length}
                    onHeaderClicked={sortingEnabled ? onHeaderClicked : undefined}
                    onHeaderContextMenu={columnMenuEnabled ? onHeaderContextMenu : undefined}
                    onCellEdited={editingEnabled ? onCellEdited : undefined}
                    onCellClicked={handleCellClicked}
                    onCellActivated={handleCellActivated}
                    gridSelection={selectionToUse}
                    onGridSelectionChange={selectionEnabled ? onSelectionChange : undefined}
                    onRowAppended={rowAppendEnabled ? handleRowAppended : undefined}
                    onColumnMoved={columnReorderEnabled ? onColumnMoved : undefined}
                    onColumnResize={columnResizeEnabled ? onColumnResize : undefined}
                    onCellContextMenu={rowMenuEnabled ? onCellContextMenu : undefined}
                    drawCell={drawCell}
                    drawHeader={drawHeader}
                    rowMarkers={rowMarkers}
                    smoothScrollX={smoothScrollX}
                    smoothScrollY={smoothScrollY}
                    getCellsForSelection={getCellsForSelection}
                    showSearch={searchEnabled ? showSearch : false}
                    onSearchClose={() => {
                        if (showSearchEffectiveProp === undefined) {
                            setShowSearch(false);
                        }
                        onSearchCloseEffectiveProp?.();
                    }}
                    keybindings={mergedKeybindings}
                    trailingRowOptions={trailingRowOptions}
                    rangeSelect={rangeSelect}
                    columnSelect={columnSelect}
                    rowSelect={rowSelect}
                    theme={mergedTheme}
                    experimental={mergedExperimental}
                />
            </div>

            {columnMenuEnabled && menuConfig && (
                <ContextMenu
                    x={menuConfig.x}
                    y={menuConfig.y}
                    onClose={() => setMenuConfig(undefined)}
                    items={[
                        { label: "Adicionar Coluna", icon: "+", onClick: addColumn },
                        { label: "Renomear Coluna", icon: "E", onClick: renameColumn },
                        { label: "Excluir Coluna", icon: "x", onClick: removeColumn },
                    ]}
                />
            )}

            {rowMenuEnabled && rowMenuConfig && (
                <ContextMenu
                    x={rowMenuConfig.x}
                    y={rowMenuConfig.y}
                    onClose={() => setRowMenuConfig(undefined)}
                    items={[
                        { label: "Adicionar Linha Acima", icon: "^", onClick: addRowAbove },
                        { label: "Adicionar Linha Abaixo", icon: "v", onClick: addRowBelow, dividerAfter: true },
                        { label: "Excluir Linha", icon: "x", onClick: deleteRow },
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
                            if (e.key === "Enter") confirmRename(e.currentTarget.value);
                            if (e.key === "Escape") setRenameModal(undefined);
                        }}
                        onBlur={e => confirmRename(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default MyGlideGrid;
