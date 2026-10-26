import { jsx as _jsx } from "react/jsx-runtime";
import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
const DEFAULT_COLOR = '#E1E4E8';
function KPSkeletonBase({ aspectRatio, animated = true, color = DEFAULT_COLOR, style, }) {
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (!animated) {
            opacity.setValue(1);
            return undefined;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(opacity, {
                toValue: 0.45,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => loop.stop();
    }, [animated, opacity]);
    return (_jsx(Animated.View, { testID: "kp-skeleton", accessibilityRole: "progressbar", style: [
            styles.base,
            { backgroundColor: color, opacity },
            aspectRatio ? { aspectRatio } : null,
            style,
        ] }));
}
export const KPSkeleton = memo(KPSkeletonBase);
const styles = StyleSheet.create({
    base: { width: '100%', borderRadius: 8 },
});
