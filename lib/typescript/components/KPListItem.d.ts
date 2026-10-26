import React from 'react';
import type { KPRenderItem } from '../types';
interface Props<T> {
    item: T;
    index: number;
    numColumns: number;
    columnGap: number;
    rowGap: number;
    containerWidth: number;
    itemAspectRatio?: number;
    renderItem: KPRenderItem<T>;
    onItemPress?: (item: T, index: number) => void;
}
/**
 * Stateless cell wrapper: applies gap padding, optional aspect ratio and press
 * handling. Holding no state means a recycled cell can never leak anything.
 */
declare function KPListItemBase<T>({ item, index, numColumns, columnGap, rowGap, containerWidth, itemAspectRatio, renderItem, onItemPress, }: Props<T>): React.JSX.Element;
export declare const KPListItem: typeof KPListItemBase;
export {};
