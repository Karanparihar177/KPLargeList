import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useItemVisibility} from '../hooks/useItemVisibility';
import type {KPItemLayout, KPLargeListProps} from '../types';
import {getColumnIndex, getItemWidth, sanitizeColumns} from '../utils/layout';
import {KPListItem} from './KPListItem';
import {KPSkeleton} from './KPSkeleton';

interface SkeletonEntry {
  readonly kpSkeleton: number;
}
type Entry<T> = T | SkeletonEntry;

const SKELETON_TYPE = 'kp-skeleton';
// FlashList's own default is 250px, which is too small for fast flings.
const DEFAULT_DRAW_DISTANCE = 1200;

function isSkeleton<T>(entry: Entry<T>): entry is SkeletonEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof (entry as SkeletonEntry).kpSkeleton === 'number'
  );
}

function asItem<T>(entry: Entry<T>): T {
  return entry as T;
}

export function KPLargeList<T>({
  data,
  keyExtractor,
  renderItem,
  numColumns: numColumnsProp,
  columnGap = 0,
  rowGap = 0,
  itemAspectRatio,
  onItemPress,
  onItemVisibilityChange,
  getItemType,
  drawDistance = DEFAULT_DRAW_DISTANCE,
  loading = false,
  skeletonCount,
  renderSkeleton,
  error,
  renderError,
  ListEmptyComponent,
  style,
  contentContainerStyle,
  testID,
  listProps,
}: KPLargeListProps<T>) {
  const numColumns = sanitizeColumns(numColumnsProp);
  // Measured container width, not the screen width, so nested layouts and
  // rotation produce the right item sizes.
  const [containerWidth, setContainerWidth] = useState(0);
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const next = e.nativeEvent.layout.width;
      setContainerWidth(prev => (Math.abs(prev - next) < 0.5 ? prev : next));
      listProps?.onLayout?.(e);
    },
    [listProps],
  );

  const skeletons = useMemo<SkeletonEntry[]>(
    () =>
      Array.from({length: skeletonCount ?? numColumns * 3}, (_, i) => ({
        kpSkeleton: i,
      })),
    [skeletonCount, numColumns],
  );

  const hasError = error != null && error !== false && data.length === 0;
  const entries: readonly Entry<T>[] = loading ? skeletons : data;

  const renderEntry = useCallback(
    ({item, index}: {item: Entry<T>; index: number}) => {
      if (isSkeleton(item)) {
        const layout: KPItemLayout = {
          width: getItemWidth(containerWidth, numColumns, columnGap),
          columnIndex: getColumnIndex(index, numColumns),
          numColumns,
        };
        return (
          <KPListItem<SkeletonEntry>
            item={item}
            index={index}
            numColumns={numColumns}
            columnGap={columnGap}
            rowGap={rowGap}
            containerWidth={containerWidth}
            itemAspectRatio={itemAspectRatio}
            renderItem={() =>
              renderSkeleton ? (
                renderSkeleton(index, layout)
              ) : (
                <KPSkeleton
                  aspectRatio={itemAspectRatio ?? 1}
                  style={itemAspectRatio ? styles.fillHeight : undefined}
                />
              )
            }
          />
        );
      }
      return (
        <KPListItem<T>
          item={item}
          index={index}
          numColumns={numColumns}
          columnGap={columnGap}
          rowGap={rowGap}
          containerWidth={containerWidth}
          itemAspectRatio={itemAspectRatio}
          renderItem={renderItem}
          onItemPress={onItemPress}
        />
      );
    },
    [
      containerWidth,
      numColumns,
      columnGap,
      rowGap,
      itemAspectRatio,
      renderItem,
      renderSkeleton,
      onItemPress,
    ],
  );

  const keyOf = useCallback(
    (entry: Entry<T>, index: number) =>
      isSkeleton(entry)
        ? `${SKELETON_TYPE}-${entry.kpSkeleton}`
        : keyExtractor(entry, index),
    [keyExtractor],
  );

  const typeOf = useCallback(
    (entry: Entry<T>, index: number) =>
      isSkeleton(entry) ? SKELETON_TYPE : getItemType?.(entry, index),
    [getItemType],
  );

  const visibility = useItemVisibility<T, Entry<T>>(
    onItemVisibilityChange,
    isSkeleton,
    asItem,
  );

  const empty = hasError
    ? renderError?.(error) ?? null
    : ListEmptyComponent ?? null;

  return (
    <FlashList<Entry<T>>
      testID={testID}
      {...(listProps as object)}
      data={entries}
      renderItem={renderEntry}
      keyExtractor={keyOf}
      getItemType={typeOf}
      numColumns={numColumns}
      drawDistance={drawDistance}
      // Gap padding depends on these; make FlashList re-render cells when they change.
      extraData={`${containerWidth}|${numColumns}|${columnGap}|${rowGap}|${itemAspectRatio}`}
      onLayout={onLayout}
      style={style}
      contentContainerStyle={contentContainerStyle as never}
      ListEmptyComponent={empty}
      onViewableItemsChanged={visibility.onViewableItemsChanged}
      viewabilityConfig={visibility.viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  fillHeight: {height: '100%'},
});
