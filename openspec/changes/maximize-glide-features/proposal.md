# Change: Maximize Glide Data Grid Features

## Why
The user wants to leverage the full power of `glide-data-grid` within the enterprise wrapper. Currently, the wrapper supports basic cell types and common features, but many advanced capabilities (row reordering, grouped headers, specialized cells like Markdown and Images, frozen columns) are not yet explicitly exposed or demonstrated. 

## What Changes
- **Expanded Cell Support**: Update `getCellContent` to support `Markdown`, `Image`, `Uri`, `Bubble`, and `RowID` cells.
- **Advanced Layouts**: Enable and demonstrate **Grouped Headers** and **Frozen Columns**.
- **Interactive Features**: Implement **Row Reordering** (`onRowMoved`).
- **Data Enrichment**: Update the demo data in `App.tsx` to include rich content (Markdown, URLs, Image links).
- **Refined Feature Flags**: Add flags for `rowReordering`, `groupedHeaders`, and `frozenColumnsCount`.

## Impact
- **Affected specs**: `grid-layered-components`
- **Affected code**: 
    - `src/components/MyGlideGrid.tsx`
    - `src/components/grid/types.ts`
    - `src/components/grid/useGridData.ts`
    - `src/App.tsx`
