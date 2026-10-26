import { jsx as _jsx } from "react/jsx-runtime";
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { getCellPadding, getColumnIndex, getItemWidth } from '../utils/layout';
/**
 * Stateless cell wrapper: applies gap padding, optional aspect ratio and press
 * handling. Holding no state means a recycled cell can never leak anything.
 */
function KPListItemBase({ item, index, numColumns, columnGap, rowGap, containerWidth, itemAspectRatio, renderItem, onItemPress, }) {
    const layout = {
        width: getItemWidth(containerWidth, numColumns, columnGap),
        columnIndex: getColumnIndex(index, numColumns),
        numColumns,
    };
    const content = renderItem(item, index, layout);
    const handlePress = useCallback(() => onItemPress === null || onItemPress === void 0 ? void 0 : onItemPress(item, index), [onItemPress, item, index]);
    return (_jsx(View, { style: getCellPadding(index, numColumns, columnGap, rowGap), children: _jsx(View, { style: itemAspectRatio ? { aspectRatio: itemAspectRatio } : undefined, children: onItemPress ? (_jsx(Pressable, { accessibilityRole: "button", onPress: handlePress, style: itemAspectRatio ? styles.fill : undefined, children: content })) : (content) }) }));
}
export const KPListItem = memo(KPListItemBase);
const styles = StyleSheet.create({
    fill: { flex: 1 },
});
