## 1. Types & Configuration
- [x] 1.1 Update `FeatureFlags` in `types.ts` to include `rowReorder`, `groupHeaders`, and `freezeColumns`.
- [x] 1.2 Add `cellType` property to `GridColumn` extensions if needed, or infer from data.

## 2. Hook Enhancements
- [x] 2.1 Update `useGridData.ts` to include `onRowMoved` logic and state sync.

## 3. Component Refactor (MyGlideGrid)
- [x] 3.1 Enhance `getCellContent` to handle:
    - `MarkdownCell` (using `marked`)
    - `ImageCell`
    - `BubbleCell` (for tags/chips)
    - `UriCell`
- [x] 3.2 Map new feature flags to `DataEditor` props (`onRowMoved`, `freezeColumns`, etc).
- [x] 3.3 Ensure `drawCell` (if any) doesn't interfere with new cell types. (Current refactored version uses native rendering mostly).

## 4. Dashboard Demo (App.tsx)
- [x] 4.1 Create a new "Power User" tab in `App.tsx`.
- [x] 4.2 Populate with ultra-rich data:
    - Bio with Markdown.
    - Profile Images.
    - Tags as Bubbles.
    - Grouped columns (e.g., "Personal Info" vs "Professional Data").
- [x] 4.3 Enable frozen columns and row moving in this tab.
