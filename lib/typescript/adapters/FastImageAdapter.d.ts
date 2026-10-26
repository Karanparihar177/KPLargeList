import React from 'react';
import type { KPImageBackendProps } from '../types';
/**
 * The only module that imports the native image library. Swap this file (and
 * nothing else) to change backends; it must satisfy `KPImageBackendProps`.
 */
export declare function FastImageAdapter({ source, resizeMode, recyclingKey, style, onLoad, onError, accessibilityLabel, testID, }: KPImageBackendProps): React.JSX.Element;
