import {useCallback, useMemo, useRef} from 'react';
import type {FlashListProps} from '@shopify/flash-list';

type ViewableHandler<E> = NonNullable<
  FlashListProps<E>['onViewableItemsChanged']
>;

const VIEWABILITY_CONFIG: NonNullable<FlashListProps<unknown>['viewabilityConfig']> = {
  // Any visible pixel counts, so media can start before an item is fully on screen.
  itemVisiblePercentThreshold: 1,
};

/**
 * Adapts FlashList viewability events to a per-item callback. The returned
 * handler and config are referentially stable, as FlashList requires.
 */
export function useItemVisibility<T, E>(
  onItemVisibilityChange:
    | ((item: T, index: number, isVisible: boolean) => void)
    | undefined,
  isSkeleton: (entry: E) => boolean,
  toItem: (entry: E) => T,
) {
  const callbackRef = useRef(onItemVisibilityChange);
  callbackRef.current = onItemVisibilityChange;
  const skeletonRef = useRef(isSkeleton);
  skeletonRef.current = isSkeleton;
  const toItemRef = useRef(toItem);
  toItemRef.current = toItem;

  const handler = useCallback<ViewableHandler<E>>(({changed}) => {
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

  return useMemo(
    () => ({
      // Registering nothing when unused keeps FlashList from doing viewability work.
      onViewableItemsChanged: onItemVisibilityChange ? handler : undefined,
      viewabilityConfig: VIEWABILITY_CONFIG,
    }),
    [handler, onItemVisibilityChange !== undefined], // eslint-disable-line react-hooks/exhaustive-deps
  );
}
