import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {FastImageAdapter} from '../adapters/FastImageAdapter';
import type {KPImageProps, KPImageSource} from '../types';
import {KPSkeleton} from './KPSkeleton';

type Status = 'loading' | 'loaded' | 'error';

/** Identity of what the cell is showing; headers are part of it. */
function getSourceKey(source: KPImageSource | null | undefined): string {
  if (source == null) {
    return '';
  }
  if (typeof source === 'number') {
    return `asset:${source}`;
  }
  return source.headers
    ? `${source.uri}|${JSON.stringify(source.headers)}`
    : source.uri;
}

function KPImageBase({
  source,
  aspectRatio,
  resizeMode = 'cover',
  placeholder,
  fallback = null,
  style,
  onLoad,
  onError,
  accessibilityLabel,
  testID,
}: KPImageProps) {
  const key = getSourceKey(source);
  // Status is stored together with the source it belongs to. When a recycled
  // cell receives a new source the stored key no longer matches, so the status
  // reads as 'loading' on the very same render, without an effect or a stale frame.
  const [state, setState] = useState<{key: string; status: Status}>({
    key,
    status: 'loading',
  });
  const status: Status = !key
    ? 'error'
    : state.key === key
    ? state.status
    : 'loading';

  const handleLoad = useCallback(
    (size: {width: number; height: number}) => {
      setState({key, status: 'loaded'});
      onLoad?.(size);
    },
    [key, onLoad],
  );
  const handleError = useCallback(
    (message: string) => {
      setState({key, status: 'error'});
      onError?.(message);
    },
    [key, onError],
  );

  return (
    <View
      testID={testID}
      style={[styles.container, aspectRatio ? {aspectRatio} : null, style]}
    >
      {key && status !== 'error' && source != null ? (
        <FastImageAdapter
          testID={testID ? `${testID}-image` : undefined}
          source={source}
          resizeMode={resizeMode}
          recyclingKey={key}
          style={StyleSheet.absoluteFill}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={accessibilityLabel}
        />
      ) : null}
      {status === 'loading' && placeholder !== null ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {placeholder ?? <KPSkeleton style={styles.fill} />}
        </View>
      ) : null}
      {status === 'error' ? (
        <View
          testID={testID ? `${testID}-fallback` : undefined}
          style={StyleSheet.absoluteFill}
        >
          {fallback}
        </View>
      ) : null}
    </View>
  );
}

export const KPImage = memo(KPImageBase);

const styles = StyleSheet.create({
  container: {width: '100%', overflow: 'hidden'},
  fill: {width: '100%', height: '100%', borderRadius: 0},
});
