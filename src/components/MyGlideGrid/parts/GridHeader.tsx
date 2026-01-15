import React from "react";

interface GridHeaderProps {
    totalRecords: number;
    isLocked: boolean;
    onToggleLock: () => void;
    lockButtonTitle?: string;
    showStats?: boolean;
    lockingEnabled: boolean;
    onToggleSearch: () => void;
    searchEnabled: boolean;
    isSearchVisible: boolean;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
    totalRecords,
    isLocked,
    onToggleLock,
    lockButtonTitle,
    showStats = true,
    lockingEnabled,
    onToggleSearch,
    searchEnabled,
    isSearchVisible,
}) => {
    return (
        <div className="grid-header">
            <div className="left-controls">
                {showStats && (
                    <span className="grid-stats">
                        Total de registros: <strong>{totalRecords}</strong>
                    </span>
                )}
                {searchEnabled && (
                    <button
                        className={`btn-enterprise ${isSearchVisible ? "active" : ""}`}
                        onClick={onToggleSearch}
                        title="Buscar (Ctrl + F)"
                        style={{ marginLeft: '1rem' }}
                    >
                        🔍 Buscar
                    </button>
                )}
            </div>
            <div className="right-controls">
                {lockingEnabled && (
                    <button
                        className={`btn-enterprise ${isLocked ? "active" : ""}`}
                        onClick={onToggleLock}
                        title={lockButtonTitle || (isLocked ? "Desbloquear Edição" : "Bloquear Edição")}
                    >
                        {isLocked ? "🔒 Locked" : "🔓 Unlocked"}
                    </button>
                )}
            </div>
        </div>
    );
};
