import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FastImageAdapter } from '../adapters/FastImageAdapter';
import { KPSkeleton } from './KPSkeleton';
/** Identity of what the cell is showing; headers are part of it. */
function getSourceKey(source) {
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
function KPImageBase({ source, aspectRatio, resizeMode = 'cover', placeholder, fallback = null, style, onLoad, onError, accessibilityLabel, testID, }) {
    const key = getSourceKey(source);
    // Status is stored together with the source it belongs to. When a recycled
    // cell receives a new source the stored key no longer matches, so the status
    // reads as 'loading' on the very same render, without an effect or a stale frame.
    const [state, setState] = useState({
        key,
        status: 'loading',
    });
    const status = !key
        ? 'error'
        : state.key === key
            ? state.status
            : 'loading';
    const handleLoad = useCallback((size) => {
        setState({ key, status: 'loaded' });
        onLoad === null || onLoad === void 0 ? void 0 : onLoad(size);
    }, [key, onLoad]);
    const handleError = useCallback((message) => {
        setState({ key, status: 'error' });
        onError === null || onError === void 0 ? void 0 : onError(message);
    }, [key, onError]);
    return (_jsxs(View, { testID: testID, style: [styles.container, aspectRatio ? { aspectRatio } : null, style], children: [key && status !== 'error' && source != null ? (_jsx(FastImageAdapter, { testID: testID ? `${testID}-image` : undefined, source: source, resizeMode: resizeMode, recyclingKey: key, style: StyleSheet.absoluteFill, onLoad: handleLoad, onError: handleError, accessibilityLabel: accessibilityLabel })) : null, status === 'loading' && placeholder !== null ? (_jsx(View, { style: StyleSheet.absoluteFill, pointerEvents: "none", children: placeholder !== null && placeholder !== void 0 ? placeholder : _jsx(KPSkeleton, { style: styles.fill }) })) : null, status === 'error' ? (_jsx(View, { testID: testID ? `${testID}-fallback` : undefined, style: StyleSheet.absoluteFill, children: fallback })) : null] }));
}
export const KPImage = memo(KPImageBase);
const styles = StyleSheet.create({
    container: { width: '100%', overflow: 'hidden' },
    fill: { width: '100%', height: '100%', borderRadius: 0 },
});
