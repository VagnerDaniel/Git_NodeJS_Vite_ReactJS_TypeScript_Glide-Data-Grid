import DataEditor, { type DataEditorProps } from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";

export type GlideGridCoreProps = DataEditorProps;

const defaultTheme = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    accentColor: "#0052cc",
    accentLight: "rgba(0, 82, 204, 0.1)",
};

const GlideGridCore = (props: GlideGridCoreProps) => {
    const { theme, ...rest } = props;

    return (
        <DataEditor
            {...rest}
            theme={{ ...defaultTheme, ...theme }}
            smoothScrollX={props.smoothScrollX ?? true}
            smoothScrollY={props.smoothScrollY ?? true}
            rowMarkers={props.rowMarkers ?? "both"}
        />
    );
};

export default GlideGridCore;
