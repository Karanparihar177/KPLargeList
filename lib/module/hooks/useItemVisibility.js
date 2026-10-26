import { useCallback, useMemo, useRef } from 'react';
const VIEWABILITY_CONFIG = {
    // Any visible pixel counts, so media can start before an item is fully on screen.
    itemVisiblePercentThreshold: 1,
};
/**
 * Adapts FlashList viewability events to a per-item callback. The returned
 * handler and config are referentially stable, as FlashList requires.
 */
export function useItemVisibility(onItemVisibilityChange, isSkeleton, toItem) {
    const callbackRef = useRef(onItemVisibilityChange);
    callbackRef.current = onItemVisibilityChange;
    const skeletonRef = useRef(isSkeleton);
    skeletonRef.current = isSkeleton;
    const toItemRef = useRef(toItem);
    toItemRef.current = toItem;
    const handler = useCallback(({ changed }) => {
        const cb = callbackRef.current;
        if (!cb) {
            return;
        }
        for (const token of changed) {
            if (token.index != null && !skeletonRef.current(token.item)) {
                cb(toItemRef.current(token.item), token.index, token.isViewable);
            }
        }
    }, []);
    return useMemo(() => ({
        // Registering nothing when unused keeps FlashList from doing viewability work.
        onViewableItemsChanged: onItemVisibilityChange ? handler : undefined,
        viewabilityConfig: VIEWABILITY_CONFIG,
    }), [handler, onItemVisibilityChange !== undefined]);
}
