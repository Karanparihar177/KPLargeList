export function sanitizeColumns(numColumns: number | undefined): number {
  return numColumns && numColumns >= 1 ? Math.floor(numColumns) : 1;
}

/** Content width of one item once column gaps are removed from the container. */
export function getItemWidth(
  containerWidth: number,
  numColumns: number,
  columnGap: number,
): number {
  if (containerWidth <= 0) {
    return 0;
  }
  return Math.max(
    0,
    (containerWidth - (numColumns - 1) * columnGap) / numColumns,
  );
}

export function getColumnIndex(index: number, numColumns: number): number {
  return index % numColumns;
}

/**
 * FlashList cells have equal widths and no gap support, so gaps are applied as
 * cell padding. Column c gets c*g/n on the left and (n-1-c)*g/n on the right,
 * which yields exactly `g` between neighbours and 0 at the outer edges.
 * Row gap is applied above every row except the first.
 */
export function getCellPadding(
  index: number,
  numColumns: number,
  columnGap: number,
  rowGap: number,
): {paddingLeft: number; paddingRight: number; paddingTop: number} {
  const column = getColumnIndex(index, numColumns);
  return {
    paddingLeft: (column * columnGap) / numColumns,
    paddingRight: ((numColumns - 1 - column) * columnGap) / numColumns,
    paddingTop: index >= numColumns ? rowGap : 0,
  };
}
