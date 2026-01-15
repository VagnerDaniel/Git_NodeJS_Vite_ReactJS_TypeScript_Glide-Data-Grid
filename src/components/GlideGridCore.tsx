import DataEditor, { type DataEditorProps } from "@glideapps/glide-data-grid";

import "@glideapps/glide-data-grid/dist/index.css";

export type GlideGridCoreProps = DataEditorProps;

const GlideGridCore = (props: GlideGridCoreProps) => {
    return <DataEditor {...props} />;
};

export default GlideGridCore;
