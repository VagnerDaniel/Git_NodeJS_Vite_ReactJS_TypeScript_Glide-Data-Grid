import { useState, useCallback } from "react";

interface MenuConfig {
    x: number;
    y: number;
    index: number;
    bounds?: { x: number, y: number, width: number, height: number };
}

export const useGridMenus = (columnMenuEnabled: boolean, rowMenuEnabled: boolean) => {
    const [headerMenu, setHeaderMenu] = useState<MenuConfig | undefined>();
    const [rowMenu, setRowMenu] = useState<MenuConfig | undefined>();
    const [renameModal, setRenameModal] = useState<{ index: number, title: string, x: number, y: number, width: number, height: number } | undefined>();

    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 180;

    const onHeaderContextMenu = useCallback((colIndex: number, event: any) => {
        if (!columnMenuEnabled) return;
        event.preventDefault();
        const { bounds } = event;
        let x = bounds.x;
        let y = bounds.y + bounds.height;

        if (x + MENU_WIDTH > window.innerWidth) x = window.innerWidth - MENU_WIDTH - 10;
        if (y + MENU_HEIGHT > window.innerHeight) y = bounds.y - MENU_HEIGHT;

        setHeaderMenu({ x: Math.max(10, x), y: Math.max(10, y), index: colIndex, bounds });
    }, [columnMenuEnabled]);

    const onRowContextMenu = useCallback((rowIndex: number, event: any) => {
        if (!rowMenuEnabled) return;
        event.preventDefault();
        const { bounds } = event;
        let x = bounds.x + bounds.width;
        let y = bounds.y;

        if (x + MENU_WIDTH > window.innerWidth) x = window.innerWidth - MENU_WIDTH - 10;
        if (y + MENU_HEIGHT > window.innerHeight) y = bounds.y - MENU_HEIGHT + bounds.height;

        setRowMenu({ x: Math.max(10, x), y: Math.max(10, y), index: rowIndex });
    }, [rowMenuEnabled]);

    return {
        headerMenu,
        setHeaderMenu,
        rowMenu,
        setRowMenu,
        renameModal,
        setRenameModal,
        onHeaderContextMenu,
        onRowContextMenu,
    };
};
