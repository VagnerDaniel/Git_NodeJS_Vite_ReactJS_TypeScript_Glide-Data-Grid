import { useState, useEffect } from "react";
import type { SearchConfig, SearchOffset } from "../types";

interface UseGridSearchProps {
    enabled: boolean;
    config: SearchConfig;
    showSearchProp?: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const SEARCH_DEFAULT_OFFSET_X = 20;
const SEARCH_DEFAULT_OFFSET_Y = 0;

const resolveOffset = (value: SearchOffset | undefined, reference: number, fallback: number): number => {
    if (value === undefined) return fallback;
    const raw = value.trim();
    if (raw.endsWith("%")) {
        const percent = Number.parseFloat(raw);
        return Number.isNaN(percent) ? fallback : (reference * percent) / 100;
    }
    if (raw.endsWith("rem")) {
        const rem = Number.parseFloat(raw);
        const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return Number.isNaN(rem) ? fallback : rem * rootSize;
    }
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

export const useGridSearch = ({
    enabled,
    config,
    showSearchProp,
    containerRef,
}: UseGridSearchProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setIsVisible(false);
            return;
        }
        if (showSearchProp !== undefined) {
            setIsVisible(showSearchProp);
        }
    }, [showSearchProp, enabled]);

    useEffect(() => {
        if (!enabled || !isVisible) return;

        const container = containerRef.current;
        if (!container) return;

        const searchInner = container.querySelector(".gdg-search-bar-inner") as HTMLElement | null;
        const wrapper = searchInner?.parentElement as HTMLElement | null;
        if (!searchInner || !wrapper) return;

        let dragging = false;
        let startX = 0, startY = 0, originLeft = 0, originTop = 0;

        const applyPosition = (left: number, top: number, mode: "absolute" | "fixed" = "absolute") => {
            wrapper.style.position = mode;
            wrapper.style.left = `${left}px`;
            wrapper.style.top = `${top}px`;
            wrapper.style.right = "auto";
            wrapper.style.transform = "none";
        };

        const initPos = () => {
            const cRect = container.getBoundingClientRect();
            const wRect = wrapper.getBoundingClientRect();
            const offX = resolveOffset(config.offsetX, cRect.width, SEARCH_DEFAULT_OFFSET_X);
            const offY = resolveOffset(config.offsetY, cRect.height, SEARCH_DEFAULT_OFFSET_Y);
            applyPosition(
                clamp(cRect.width - wRect.width - offX, 0, cRect.width - wRect.width),
                clamp(offY, 0, cRect.height - wRect.height)
            );
        };

        initPos();

        const onDown = (e: PointerEvent) => {
            if (!(e.target as HTMLElement).closest(".gdg-search-drag-handle")) return;
            const r = wrapper.getBoundingClientRect();
            originLeft = r.left; originTop = r.top;
            startX = e.clientX; startY = e.clientY;
            dragging = true;
            wrapper.style.cursor = "move";
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        };

        const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            const left = clamp(originLeft + (e.clientX - startX), 0, window.innerWidth - wrapper.offsetWidth);
            const top = clamp(originTop + (e.clientY - startY), 0, window.innerHeight - wrapper.offsetHeight);
            applyPosition(left, top, "fixed");
        };

        const onUp = (e: PointerEvent) => {
            dragging = false;
            wrapper.style.cursor = "";
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        };

        let handle = searchInner.querySelector(".gdg-search-drag-handle") as HTMLElement | null;
        if (!handle) {
            handle = document.createElement("div");
            handle.className = "gdg-search-drag-handle";
            handle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/></svg>`;
            searchInner.insertBefore(handle, searchInner.firstChild);
        }

        handle.addEventListener("pointerdown", onDown);
        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);

        return () => {
            handle?.removeEventListener("pointerdown", onDown);
            handle?.removeEventListener("pointermove", onMove);
            handle?.removeEventListener("pointerup", onUp);
        };
    }, [isVisible, enabled, config, containerRef]);

    return { isVisible, setIsVisible };
};
