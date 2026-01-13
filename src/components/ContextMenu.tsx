import React, { useEffect, useRef } from "react";

export interface ContextMenuItem {
    label: string;
    icon?: string;
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

/**
 * Componente de menu de contexto reutilizável.
 * Exibe um menu suspenso na posição especificada com ajuste automático
 * para não ultrapassar os limites da viewport.
 */
export default function ContextMenu({
    x,
    y,
    items,
    onClose,
    menuWidth = 200
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Ajusta posição do menu após renderização para garantir visibilidade
    useEffect(() => {
        if (!menuRef.current) return;

        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        // Ajusta se ultrapassar borda direita
        if (rect.right > viewportWidth) {
            adjustedX = viewportWidth - rect.width - 10;
        }

        // Ajusta se ultrapassar borda inferior
        if (rect.bottom > viewportHeight) {
            adjustedY = viewportHeight - rect.height - 10;
        }

        // Garante coordenadas positivas
        adjustedX = Math.max(10, adjustedX);
        adjustedY = Math.max(10, adjustedY);

        // Aplica ajustes se necessário
        if (adjustedX !== x || adjustedY !== y) {
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }
    }, [x, y]);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ top: y, left: x, minWidth: menuWidth }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <button onClick={item.onClick}>
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                    </button>
                    {item.dividerAfter && (
                        <hr style={{ border: '0.1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />
                    )}
                </React.Fragment>
            ))}
            <hr style={{ border: '0.1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />
            <button onClick={onClose}>❌ Fechar</button>
        </div>
    );
}
