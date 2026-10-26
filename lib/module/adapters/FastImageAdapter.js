import { jsx as _jsx } from "react/jsx-runtime";
import FastImage from 'react-native-fast-image';
const FIT = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'fill',
    center: 'none',
};
/**
 * The only module that imports the native image library. Swap this file (and
 * nothing else) to change backends; it must satisfy `KPImageBackendProps`.
 */
export function FastImageAdapter({ source, resizeMode, recyclingKey, style, onLoad, onError, accessibilityLabel, testID, }) {
    return (_jsx(FastImage, { testID: testID, accessibilityLabel: accessibilityLabel, source: source, objectFit: FIT[resizeMode], recyclingKey: recyclingKey, style: style, onLoad: e => onLoad(e.nativeEvent), onError: e => onError(e.nativeEvent.error) }));
}
