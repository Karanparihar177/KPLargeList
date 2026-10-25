import React from 'react';
import FastImage from 'react-native-fast-image';
import type {KPImageBackendProps, KPResizeMode} from '../types';

type FastImageFit = 'cover' | 'contain' | 'fill' | 'none';

const FIT: Record<KPResizeMode, FastImageFit> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'none',
};

/**
 * The only module that imports the native image library. Swap this file (and
 * nothing else) to change backends; it must satisfy `KPImageBackendProps`.
 */
export function FastImageAdapter({
  source,
  resizeMode,
  recyclingKey,
  style,
  onLoad,
  onError,
  accessibilityLabel,
  testID,
}: KPImageBackendProps) {
  return (
    <FastImage
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      source={source}
      objectFit={FIT[resizeMode]}
      recyclingKey={recyclingKey}
      style={style as never}
      onLoad={e => onLoad(e.nativeEvent)}
      onError={e => onError(e.nativeEvent.error)}
    />
  );
}
