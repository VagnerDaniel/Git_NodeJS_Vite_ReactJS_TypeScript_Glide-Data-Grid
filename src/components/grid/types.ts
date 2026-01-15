import type { GridColumn, DataEditorProps } from "@glideapps/glide-data-grid";

export interface GridDataRecord {
    id: number;
    [key: string]: any;
}

export interface GridColors {
    bgGrid?: string;
    bgCell?: string;
    borderHorizontal?: string;
    borderVertical?: string;
    borderHeader?: string;
    borderRowMarker?: string;
}

export type GridPreset = "default" | "compact" | "readOnly" | "audit";

export type SearchAnimation = "slide-left" | "slide-top" | "blur" | "show";

export type SearchOffset = `${number}px` | `${number}rem` | `${number}%`;

export interface SearchConfig {
    active?: boolean;
    animation?: SearchAnimation;
    offsetX?: SearchOffset;
    offsetY?: SearchOffset;
}

export interface FeatureFlags {
    selection?: boolean;
    search?: SearchConfig;
    editing?: boolean;
    sorting?: boolean;
    columnReorder?: boolean;
    columnResize?: boolean;
    rowReorder?: boolean;
    rowAppend?: boolean;
    columnMenu?: boolean;
    rowMenu?: boolean;
    stats?: boolean;
    locking?: boolean;
    freezeColumns?: number;
}

export interface MyGlideGridProps extends Partial<DataEditorProps> {
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

export interface PresetConfig {
    features: Required<FeatureFlags>;
    dataEditor: Partial<DataEditorProps>;
}
