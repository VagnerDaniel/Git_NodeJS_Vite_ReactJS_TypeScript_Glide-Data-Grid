import React, { useEffect, useRef } from "react";

export interface ContextMenuItem {
    label: string;
    icon?: string | React.ReactNode;
    onClick: () => void;
    dividerAfter?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
    menuWidth?: number;
}

export default function ContextMenu({
    x,
    y,
    items,
    onClose,
    menuWidth = 200
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                top: y,
                left: x,
                width: menuWidth,
                position: 'fixed'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <button onClick={() => { item.onClick(); onClose(); }}>
                        {item.icon && <span className="menu-icon">{item.icon}</span>}
                        <span className="menu-label">{item.label}</span>
                    </button>
                    {item.dividerAfter && <div className="divider" />}
                </React.Fragment>
            ))}
            <div className="divider" />
            <button className="menu-close" onClick={onClose}>
                <span className="menu-icon">✕</span>
                <span className="menu-label">Fechar</span>
            </button>
        </div>
    );
}
