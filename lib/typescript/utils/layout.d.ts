export declare function sanitizeColumns(numColumns: number | undefined): number;
/** Content width of one item once column gaps are removed from the container. */
export declare function getItemWidth(containerWidth: number, numColumns: number, columnGap: number): number;
export declare function getColumnIndex(index: number, numColumns: number): number;
/**
 * FlashList cells have equal widths and no gap support, so gaps are applied as
 * cell padding. Column c gets c*g/n on the left and (n-1-c)*g/n on the right,
 * which yields exactly `g` between neighbours and 0 at the outer edges.
 * Row gap is applied above every row except the first.
 */
export declare function getCellPadding(index: number, numColumns: number, columnGap: number, rowGap: number): {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
};
