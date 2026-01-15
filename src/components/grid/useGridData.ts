import { useState, useCallback, useMemo, useEffect } from "react";
import type { GridColumn, Item, GridCell } from "@glideapps/glide-data-grid";
import type { GridDataRecord } from "./types";

interface UseGridDataProps {
    initialData: GridDataRecord[];
    columns: GridColumn[];
    editingEnabled: boolean;
    sortingEnabled: boolean;
    onDataChange?: (newData: GridDataRecord[]) => void;
}

export const useGridData = ({
    initialData,
    columns,
    editingEnabled,
    sortingEnabled,
    onDataChange,
}: UseGridDataProps) => {
    const [rowsData, setRowsData] = useState<GridDataRecord[]>(initialData || []);
    const [sortState, setSortState] = useState<{ columnId?: string, direction: "asc" | "desc" } | undefined>();
    const [internalColumns, setInternalColumns] = useState<GridColumn[]>(columns);

    useEffect(() => {
        setInternalColumns(columns);
    }, [columns]);

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

    const displayColumns = useMemo(() => {
        if (!sortingEnabled || !sortState) return internalColumns;

        return internalColumns.map(c => {
            if (c.id === sortState.columnId) {
                return {
                    ...c,
                    title: `${c.title} ${sortState.direction === "asc" ? "↑" : "↓"}`
                };
            }
            return c;
        });
    }, [internalColumns, sortState, sortingEnabled]);

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

    const onCellEdited = useCallback(([col, row]: Item, newValue: GridCell) => {
        if (!editingEnabled) return;

        const columnId = internalColumns[col].id as string;
        let finalValue: any;

        if ("data" in newValue) {
            finalValue = (newValue as any).data;
        } else {
            console.warn("Unsupported cell kind for editing:", newValue.kind);
            return;
        }

        setRowsData(prev => {
            const newData = [...prev];
            newData[row] = { ...newData[row], [columnId]: finalValue };
            onDataChange?.(newData);
            return newData;
        });
    }, [internalColumns, onDataChange, editingEnabled]);

    const addRow = useCallback((index?: number) => {
        const newRecord: GridDataRecord = { id: Date.now() };
        internalColumns.forEach(c => {
            if (c.id && c.id !== "id") {
                newRecord[c.id as string] = "";
            }
        });

        setRowsData(prev => {
            const newData = [...prev];
            if (index !== undefined) {
                newData.splice(index, 0, newRecord);
            } else {
                newData.push(newRecord);
            }
            onDataChange?.(newData);
            return newData;
        });
    }, [internalColumns, onDataChange]);

    const removeRow = useCallback((index: number) => {
        setRowsData(prev => {
            const newData = prev.filter((_, i) => i !== index);
            onDataChange?.(newData);
            return newData;
        });
    }, [onDataChange]);

    const addColumn = useCallback((index: number) => {
        const newId = `col_${Date.now()}`;
        const newCol: GridColumn = { id: newId, title: "Nova Coluna", width: 150 };
        setInternalColumns(prev => {
            const next = [...prev];
            next.splice(index, 0, newCol);
            return next;
        });
    }, []);

    const removeColumn = useCallback((index: number) => {
        setInternalColumns(prev => prev.filter((_, i) => i !== index));
    }, []);

    const renameColumn = useCallback((index: number, newTitle: string) => {
        setInternalColumns(prev => {
            const next = [...prev];
            next[index] = { ...next[index], title: newTitle };
            return next;
        });
    }, []);

    const onColumnMoved = useCallback((from: number, to: number) => {
        setInternalColumns(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    }, []);

    const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
        setInternalColumns(prev => prev.map(c => c.id === column.id ? { ...c, width: newSize } : c));
    }, []);

    const onRowMoved = useCallback((from: number, to: number) => {
        setRowsData(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            onDataChange?.(next);
            return next;
        });
    }, [onDataChange]);

    return {
        rowsData: sortedRows,
        displayColumns,
        internalColumns,
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
    };
};
