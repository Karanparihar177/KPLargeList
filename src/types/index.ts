import type {ReactElement} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {FlashListProps} from '@shopify/flash-list';

/** Layout information handed to custom item renderers. */
export interface KPItemLayout {
  /** Width in px available to the item content (gaps excluded). 0 until the list is measured. */
  width: number;
  /** Zero-based column the item is placed in. */
  columnIndex: number;
  numColumns: number;
}

export type KPRenderItem<T> = (
  item: T,
  index: number,
  layout: KPItemLayout,
) => ReactElement;

export interface KPSkeletonProps {
  /** Width / height ratio. Omit to size via `style`. */
  aspectRatio?: number;
  /** Disable the pulse animation (e.g. for reduced motion or tests). */
  animated?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export interface KPLargeListProps<T> {
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: KPRenderItem<T>;

  /** Default 1. */
  numColumns?: number;
  /** Horizontal space between columns. Default 0. */
  columnGap?: number;
  /** Vertical space between rows. Default 0. */
  rowGap?: number;
  /** Width / height ratio forced on every item (`undefined` = item decides its own height). */
  itemAspectRatio?: number;

  onItemPress?: (item: T, index: number) => void;
  /** Fired when an item enters or leaves the viewport (FlashList viewability). */
  onItemVisibilityChange?: (item: T, index: number, isVisible: boolean) => void;
  /**
   * How far (px) beyond the viewport cells are pre-rendered. Larger values
   * hide blank gaps during fast flings at the cost of more mounted cells.
   * Default 1200 (about two phone screens).
   */
  drawDistance?: number;
  /** Recycling pool key; items with different types never share a cell. */
  getItemType?: (item: T, index: number) => string | number;

  /** Show skeletons instead of `data`. */
  loading?: boolean;
  skeletonCount?: number;
  /** Custom skeleton cell. Default: `KPSkeleton` honoring `itemAspectRatio`. */
  renderSkeleton?: (index: number, layout: KPItemLayout) => ReactElement;
  /** When set and `data` is empty, shown instead of the empty state. */
  error?: unknown;
  renderError?: (error: unknown) => ReactElement | null;
  ListEmptyComponent?: ReactElement | null;

  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Escape hatch for FlashList options not covered above (pull-to-refresh,
   * pagination, headers, drawDistance, ...). `data`, `renderItem`,
   * `numColumns`, `keyExtractor` and `getItemType` are owned by KPLargeList.
   */
  listProps?: Omit<
    FlashListProps<never>,
    | 'data'
    | 'renderItem'
    | 'numColumns'
    | 'keyExtractor'
    | 'getItemType'
    | 'onViewableItemsChanged'
    | 'viewabilityConfig'
  >;
}

export type KPImageSource =
  | number
  | {uri: string; headers?: Record<string, string>};
export type KPResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

export interface KPImageProps {
  source: KPImageSource | null | undefined;
  /** Width / height ratio. Reserves layout space before the image loads. */
  aspectRatio?: number;
  resizeMode?: KPResizeMode;
  /** Shown while loading. Default `KPSkeleton`. Pass `null` for none. */
  placeholder?: ReactElement | null;
  /** Shown when the source is missing or fails to load. */
  fallback?: ReactElement | null;
  style?: StyleProp<ViewStyle>;
  onLoad?: (size: {width: number; height: number}) => void;
  onError?: (message: string) => void;
  accessibilityLabel?: string;
  testID?: string;
}

/** Contract an image backend must satisfy (see `adapters/FastImageAdapter`). */
export interface KPImageBackendProps {
  source: KPImageSource;
  resizeMode: KPResizeMode;
  /** Changes whenever the cell shows a different image; lets the backend drop stale bitmaps. */
  recyclingKey: string;
  style: StyleProp<ViewStyle>;
  onLoad: (size: {width: number; height: number}) => void;
  onError: (message: string) => void;
  accessibilityLabel?: string;
  testID?: string;
}
