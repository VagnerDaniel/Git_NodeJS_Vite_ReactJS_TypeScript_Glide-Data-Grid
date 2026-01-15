import { useState, useCallback, useRef } from "react";
import {
    type Item,
    GridCellKind,
    type GridSelection,
    CompactSelection,
    type GridCell,
} from "@glideapps/glide-data-grid";

import GlideGridCore from "../GlideGridCore";
import ContextMenu from "../ContextMenu";
import { GridHeader } from "./parts/GridHeader";
import { useGridData } from "./hooks/useGridData";
import { useGridSearch } from "./hooks/useGridSearch";
import { useGridMenus } from "./hooks/useGridMenus";
import type { MyGlideGridProps, PresetConfig, GridPreset, FeatureFlags } from "./types";

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
            rowReorder: true,
            columnMenu: true,
            rowMenu: true,
            stats: true,
            locking: true,
            freezeColumns: 0,
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
            rowReorder: false,
            columnMenu: true,
            rowMenu: true,
            stats: false,
            locking: false,
            freezeColumns: 0,
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
            rowReorder: false,
            columnMenu: false,
            rowMenu: false,
            stats: true,
            locking: false,
            freezeColumns: 0,
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
            rowReorder: false,
            columnMenu: true,
            rowMenu: false,
            stats: true,
            locking: false,
            freezeColumns: 0,
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
        editableColumns = {},
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
        ...rest
    } = props;

    // 1. Resolve configuration
    const presetConfig = PRESET_CONFIGS[preset];
    const { search: featureSearchConfig, ...featureRest } = featuresProp ?? {};
    const effectiveFeatures: Required<FeatureFlags> = {
        ...presetConfig.features,
        ...featureRest,
        search: { ...presetConfig.features.search, ...featureSearchConfig },
    };

    // 2. State & Hooks
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLocked, setIsLocked] = useState(!isEditableProp);
    const [selection, setSelection] = useState<GridSelection>({
        columns: CompactSelection.empty(),
        rows: CompactSelection.empty(),
    });

    const {
        rowsData,
        displayColumns,
        onHeaderClicked,
        onCellEdited,
        addRow,
        removeRow,
        addColumn,
        removeColumn,
        renameColumn,
        onColumnMoved,
        onColumnResize,
        onRowMoved,
    } = useGridData({
        initialData,
        columns,
        editingEnabled: effectiveFeatures.editing,
        sortingEnabled: effectiveFeatures.sorting,
        onDataChange,
    });

    const { isVisible: showSearch, setIsVisible: setShowSearch } = useGridSearch({
        enabled: effectiveFeatures.search?.active ?? false,
        config: effectiveFeatures.search || {},
        showSearchProp,
        containerRef,
    });

    const {
        headerMenu,
        setHeaderMenu,
        rowMenu,
        setRowMenu,
        renameModal,
        setRenameModal,
        onHeaderContextMenu,
        onRowContextMenu,
    } = useGridMenus(
        effectiveFeatures.columnMenu && enableColumnContextMenu && !isLocked,
        effectiveFeatures.rowMenu && enableRowContextMenu && !isLocked
    );

    // 3. Logic & Callbacks
    const getCellContent = useCallback(([col, row]: Item): GridCell => {
        const column = displayColumns[col];
        const rowData = rowsData[row];
        const value = rowData ? rowData[column.id as string] : "";
        const canEdit = effectiveFeatures.editing && !isLocked && editableColumns[column.id as string] !== false;

        if (column.id === "rowId") {
            return { kind: GridCellKind.RowID, data: String(value), allowOverlay: false, readonly: true };
        }

        if (typeof value === "boolean") {
            return {
                kind: GridCellKind.Boolean,
                data: value,
                displayData: "",
                allowOverlay: false,
                readonly: !canEdit
            } as GridCell;
        }

        if (typeof value === "number") {
            return {
                kind: GridCellKind.Number,
                data: value,
                displayData: String(value),
                allowOverlay: canEdit,
                readonly: !canEdit
            } as GridCell;
        }

        const title = (column.title || "").toLowerCase();

        if (title.includes("bio") || title.includes("desc") || title.includes("info")) {
            return { kind: GridCellKind.Markdown, data: String(value), allowOverlay: true, readonly: !canEdit } as GridCell;
        }

        if (title.includes("img") || title.includes("foto") || title.includes("avatar")) {
            return {
                kind: GridCellKind.Image,
                data: value ? [String(value)] : [],
                allowOverlay: true,
                readonly: !canEdit,
                displayData: value ? [String(value)] : []
            } as GridCell;
        }

        if (title.includes("tag") || title.includes("status") || Array.isArray(value)) {
            const tags = Array.isArray(value) ? (value as string[]) : [String(value)];
            return { kind: GridCellKind.Bubble, data: tags, allowOverlay: true, readonly: !canEdit } as GridCell;
        }

        if (title.includes("link") || title.includes("url") || title.includes("email")) {
            return { kind: GridCellKind.Uri, data: String(value), displayData: String(value), allowOverlay: true, readonly: !canEdit } as GridCell;
        }

        return {
            kind: GridCellKind.Text,
            data: String(value),
            displayData: String(value),
            allowOverlay: canEdit,
            readonly: !canEdit
        } as GridCell;
    }, [rowsData, displayColumns, isLocked, editableColumns, effectiveFeatures.editing]);

    const onSelectionChange = useCallback((newSelection: GridSelection) => {
        if (!effectiveFeatures.selection) return;
        setSelection(newSelection);
        onGridSelectionChangeProp?.(newSelection);
    }, [effectiveFeatures.selection, onGridSelectionChangeProp]);

    // 4. Render Rendering
    return (
        <div className="grid-card">
            <GridHeader
                totalRecords={rowsData.length}
                isLocked={isLocked}
                onToggleLock={() => setIsLocked(!isLocked)}
                lockButtonTitle={lockButtonTitle}
                showStats={showStats && effectiveFeatures.stats}
                lockingEnabled={effectiveFeatures.locking}
                onToggleSearch={() => setShowSearch(!showSearch)}
                searchEnabled={!!effectiveFeatures.search?.active}
                isSearchVisible={showSearch}
            />

            <div className="grid-wrapper" ref={containerRef}>
                <GlideGridCore
                    {...rest}
                    {...dataEditorProps}
                    width="100%"
                    height="100%"
                    columns={displayColumns}
                    getCellContent={getCellContent}
                    rows={rowsData.length}
                    onHeaderClicked={effectiveFeatures.sorting ? onHeaderClicked : undefined}
                    onHeaderContextMenu={onHeaderContextMenu}
                    onCellEdited={onCellEdited}
                    gridSelection={gridSelectionProp ?? selection}
                    onGridSelectionChange={onSelectionChange}
                    onRowAppended={effectiveFeatures.rowAppend ? () => addRow() : undefined}
                    onColumnMoved={effectiveFeatures.columnReorder ? onColumnMoved : undefined}
                    onColumnResize={effectiveFeatures.columnResize ? onColumnResize : undefined}
                    onRowMoved={effectiveFeatures.rowReorder ? onRowMoved : undefined}
                    freezeColumns={effectiveFeatures.freezeColumns ?? dataEditorProps?.freezeColumns ?? 0}
                    onCellContextMenu={([col, row], e) => col === -1 && onRowContextMenu(row, e)}
                    showSearch={showSearch}
                    onSearchClose={() => {
                        setShowSearch(false);
                        onSearchCloseProp?.();
                    }}
                />

                {headerMenu && (
                    <ContextMenu
                        x={headerMenu.x}
                        y={headerMenu.y}
                        onClose={() => setHeaderMenu(undefined)}
                        items={[
                            { label: "Adicionar Coluna", icon: "+", onClick: () => addColumn(headerMenu.index + 1) },
                            {
                                label: "Renomear Coluna",
                                icon: "E",
                                onClick: () => {
                                    const col = displayColumns[headerMenu.index];
                                    setRenameModal({
                                        index: headerMenu.index,
                                        title: String(col.title),
                                        x: headerMenu.bounds?.x || 0,
                                        y: headerMenu.bounds?.y || 0,
                                        width: headerMenu.bounds?.width || 0,
                                        height: headerMenu.bounds?.height || 0
                                    });
                                    setHeaderMenu(undefined);
                                }
                            },
                            { label: "Excluir Coluna", icon: "x", onClick: () => removeColumn(headerMenu.index) },
                        ]}
                    />
                )}

                {rowMenu && (
                    <ContextMenu
                        x={rowMenu.x}
                        y={rowMenu.y}
                        onClose={() => setRowMenu(undefined)}
                        items={[
                            { label: "Adicionar Linha Acima", icon: "↑", onClick: () => addRow(rowMenu.index) },
                            { label: "Adicionar Linha Abaixo", icon: "↓", onClick: () => addRow(rowMenu.index + 1) },
                            { label: "Excluir Linha", icon: "x", onClick: () => removeRow(rowMenu.index) },
                        ]}
                    />
                )}

                {renameModal && (
                    <div className="inline-editor-overlay" onClick={() => setRenameModal(undefined)}>
                        <input
                            autoFocus
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
                                if (e.key === "Enter") {
                                    renameColumn(renameModal.index, e.currentTarget.value);
                                    setRenameModal(undefined);
                                }
                                if (e.key === "Escape") setRenameModal(undefined);
                            }}
                            onBlur={e => {
                                renameColumn(renameModal.index, e.target.value);
                                setRenameModal(undefined);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyGlideGrid;
