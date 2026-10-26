import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {KPItemLayout, KPRenderItem} from '../types';
import {getCellPadding, getColumnIndex, getItemWidth} from '../utils/layout';

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
function KPListItemBase<T>({
  item,
  index,
  numColumns,
  columnGap,
  rowGap,
  containerWidth,
  itemAspectRatio,
  renderItem,
  onItemPress,
}: Props<T>) {
  const layout: KPItemLayout = {
    width: getItemWidth(containerWidth, numColumns, columnGap),
    columnIndex: getColumnIndex(index, numColumns),
    numColumns,
  };
  const content = renderItem(item, index, layout);
  const handlePress = useCallback(
    () => onItemPress?.(item, index),
    [onItemPress, item, index],
  );

  return (
    <View style={getCellPadding(index, numColumns, columnGap, rowGap)}>
      <View
        style={itemAspectRatio ? {aspectRatio: itemAspectRatio} : undefined}
      >
        {onItemPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={handlePress}
            style={itemAspectRatio ? styles.fill : undefined}
          >
            {content}
          </Pressable>
        ) : (
          content
        )}
      </View>
    </View>
  );
}

export const KPListItem = memo(KPListItemBase) as typeof KPListItemBase;

const styles = StyleSheet.create({
  fill: {flex: 1},
});
