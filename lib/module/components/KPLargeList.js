import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useItemVisibility } from '../hooks/useItemVisibility';
import { sanitizeColumns } from '../utils/layout';
import { KPListItem } from './KPListItem';
import { KPSkeleton } from './KPSkeleton';
const SKELETON_TYPE = 'kp-skeleton';
// FlashList's own default is 250px, which is too small for fast flings.
const DEFAULT_DRAW_DISTANCE = 1200;
function isSkeleton(entry) {
    return (typeof entry === 'object' &&
        entry !== null &&
        typeof entry.kpSkeleton === 'number');
}
function asItem(entry) {
    return entry;
}
export function KPLargeList({ data, keyExtractor, renderItem, numColumns: numColumnsProp, columnGap = 0, rowGap = 0, itemAspectRatio, onItemPress, onItemVisibilityChange, getItemType, drawDistance = DEFAULT_DRAW_DISTANCE, loading = false, skeletonCount, renderSkeleton, error, renderError, ListEmptyComponent, style, contentContainerStyle, testID, listProps, }) {
    var _a;
    const numColumns = sanitizeColumns(numColumnsProp);
    // Measured container width, not the screen width, so nested layouts and
    // rotation produce the right item sizes.
    const [containerWidth, setContainerWidth] = useState(0);
    // Read through a ref so an inline `listProps` object from the parent does not
    // recreate `onLayout` on every render.
    const listOnLayoutRef = useRef(listProps === null || listProps === void 0 ? void 0 : listProps.onLayout);
    listOnLayoutRef.current = listProps === null || listProps === void 0 ? void 0 : listProps.onLayout;
    const onLayout = useCallback((e) => {
        var _a;
        const next = e.nativeEvent.layout.width;
        setContainerWidth(prev => (Math.abs(prev - next) < 0.5 ? prev : next));
        (_a = listOnLayoutRef.current) === null || _a === void 0 ? void 0 : _a.call(listOnLayoutRef, e);
    }, []);
    const skeletons = useMemo(() => Array.from({ length: skeletonCount !== null && skeletonCount !== void 0 ? skeletonCount : numColumns * 3 }, (_, i) => ({
        kpSkeleton: i,
    })), [skeletonCount, numColumns]);
    // Stable across renders so memoized cells are not re-rendered for nothing.
    const renderSkeletonCell = useCallback((_entry, index, layout) => renderSkeleton ? (renderSkeleton(index, layout)) : (_jsx(KPSkeleton, { aspectRatio: itemAspectRatio !== null && itemAspectRatio !== void 0 ? itemAspectRatio : 1, style: itemAspectRatio ? styles.fillHeight : undefined })), [renderSkeleton, itemAspectRatio]);
    const hasError = error != null && error !== false && data.length === 0;
    const entries = loading ? skeletons : data;
    const renderEntry = useCallback(({ item, index }) => {
        if (isSkeleton(item)) {
            return (_jsx(KPListItem, { item: item, index: index, numColumns: numColumns, columnGap: columnGap, rowGap: rowGap, containerWidth: containerWidth, itemAspectRatio: itemAspectRatio, renderItem: renderSkeletonCell }));
        }
        return (_jsx(KPListItem, { item: item, index: index, numColumns: numColumns, columnGap: columnGap, rowGap: rowGap, containerWidth: containerWidth, itemAspectRatio: itemAspectRatio, renderItem: renderItem, onItemPress: onItemPress }));
    }, [
        containerWidth,
        numColumns,
        columnGap,
        rowGap,
        itemAspectRatio,
        renderItem,
        renderSkeletonCell,
        onItemPress,
    ]);
    const keyOf = useCallback((entry, index) => isSkeleton(entry)
        ? `${SKELETON_TYPE}-${entry.kpSkeleton}`
        : keyExtractor(entry, index), [keyExtractor]);
    const typeOf = useCallback((entry, index) => isSkeleton(entry) ? SKELETON_TYPE : getItemType === null || getItemType === void 0 ? void 0 : getItemType(entry, index), [getItemType]);
    const visibility = useItemVisibility(onItemVisibilityChange, isSkeleton, asItem);
    const empty = hasError
        ? (_a = renderError === null || renderError === void 0 ? void 0 : renderError(error)) !== null && _a !== void 0 ? _a : null
        : ListEmptyComponent !== null && ListEmptyComponent !== void 0 ? ListEmptyComponent : null;
    return (_jsx(FlashList, { testID: testID, ...listProps, data: entries, renderItem: renderEntry, keyExtractor: keyOf, getItemType: typeOf, numColumns: numColumns, drawDistance: drawDistance, 
        // Gap padding depends on these; make FlashList re-render cells when they change.
        extraData: `${containerWidth}|${numColumns}|${columnGap}|${rowGap}|${itemAspectRatio}`, onLayout: onLayout, style: style, contentContainerStyle: contentContainerStyle, ListEmptyComponent: empty, onViewableItemsChanged: visibility.onViewableItemsChanged, viewabilityConfig: visibility.viewabilityConfig }));
}
const styles = StyleSheet.create({
    fillHeight: { height: '100%' },
});
