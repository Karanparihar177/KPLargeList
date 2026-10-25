# Changelog

## 0.1.0

Initial release.

- `KPLargeList`: generic list and grid on FlashList v2, with column and row gaps, skeleton, empty and error states, press and visibility callbacks, and a `listProps` escape hatch.
- `KPImage`: natively cached image with skeleton placeholder and fallback, keyed to its source so recycled cells never show stale state.
- `KPSkeleton`: lightweight animated placeholder with no extra dependencies.
- Image backend isolated in `FastImageAdapter` (`react-native-fast-image` 10.8.5).
