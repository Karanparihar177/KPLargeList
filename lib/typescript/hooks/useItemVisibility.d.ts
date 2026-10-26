/**
 * Adapts FlashList viewability events to a per-item callback. The returned
 * handler and config are referentially stable, as FlashList requires.
 */
export declare function useItemVisibility<T, E>(onItemVisibilityChange: ((item: T, index: number, isVisible: boolean) => void) | undefined, isSkeleton: (entry: E) => boolean, toItem: (entry: E) => T): {
    onViewableItemsChanged: ((info: {
        viewableItems: import("@shopify/flash-list").ViewToken<E>[];
        changed: import("@shopify/flash-list").ViewToken<E>[];
    }) => void) | undefined;
    viewabilityConfig: any;
};
