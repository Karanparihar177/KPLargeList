import React from 'react';
import type { KPLargeListProps } from '../types';
export declare function KPLargeList<T>({ data, keyExtractor, renderItem, numColumns: numColumnsProp, columnGap, rowGap, itemAspectRatio, onItemPress, onItemVisibilityChange, getItemType, drawDistance, loading, skeletonCount, renderSkeleton, error, renderError, ListEmptyComponent, style, contentContainerStyle, testID, listProps, }: KPLargeListProps<T>): React.JSX.Element;
