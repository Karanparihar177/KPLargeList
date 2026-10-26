# kp-large-list

A generic, high-performance list and grid for React Native. `KPLargeList` is built on [FlashList v2](https://shopify.github.io/flash-list/) for virtualization and cell recycling. `KPImage` adds native image caching with a skeleton and a fallback. Items can be any type, and layouts are fully provided by you.

## Requirements

| | Supported |
|---|---|
| React Native | 0.83+ (developed on 0.88) |
| New Architecture | Required |
| React | 19+ |
| `@shopify/flash-list` | 2.x |
| `react-native-fast-image` | 10.x (pin an exact version, the library is young) |

## Install

```sh
yarn add git+https://github.com/Karanparihar177/KPLargeList.git#v0.1.0 @shopify/flash-list react-native-fast-image
cd ios && bundle exec pod install
```

The package is installed from its GitHub tag. The built `lib/` folder is committed, so the install needs no build step. To pin a newer release, change `#v0.1.0` to the new tag.

Both native dependencies autolink. The image backend lives in one file, `src/adapters/FastImageAdapter.tsx`, so it can be replaced without changing the public API.

**iOS note:** SDWebImage, a dependency of FastImage, declares iOS 9, which current Xcode rejects. If the build fails with "deployment target 9.0", add this to your Podfile's `post_install`:

```ruby
min_ios = Pod::Config.instance.podfile.target_definitions['YourTarget'].platform.deployment_target.to_s.to_f
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |bc|
    bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios.to_s if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < min_ios
  end
end
```

## Usage

`KPLargeList` is generic. The item type comes from `data`, so any shape works.

```tsx
import {KPImage, KPLargeList} from 'kp-large-list';

interface Article {
  id: string;
  headline: string;
  author: string;
  coverUrl: string;
  readMinutes: number;
}

<KPLargeList<Article>
  data={articles}
  numColumns={2}
  columnGap={8}
  rowGap={8}
  keyExtractor={article => article.id}
  renderItem={(article, index, {width}) => (
    <ArticleCard article={article} width={width} />
  )}
  onItemPress={article => openArticle(article.id)}
  loading={isLoading}
  error={error}
  renderError={err => <ErrorView error={err} />}
  ListEmptyComponent={<EmptyState />}
/>
```

Your own components go inside `renderItem`. Each cell gets the item, its index, and the layout (`width`, `columnIndex`, `numColumns`), so you can lay out a card however you like:

```tsx
function ArticleCard({article, width}: {article: Article; width: number}) {
  return (
    <View style={{width}}>
      <KPImage
        source={{uri: article.coverUrl}}
        aspectRatio={16 / 9}
        fallback={<Placeholder />}
      />
      <Text>{article.headline}</Text>
      <Text>{article.author} · {article.readMinutes} min</Text>
    </View>
  );
}
```

Custom skeletons, empty states and error states are also render props. Pass a component or an element, whichever fits:

```tsx
<KPLargeList
  data={[]}
  loading
  skeletonCount={6}
  renderSkeleton={(index, layout) => <ArticleSkeleton width={layout.width} />}
  keyExtractor={a => a.id}
  renderItem={a => <ArticleCard article={a} width={0} />}
/>
```

## `KPLargeList` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `readonly T[]` | required | Items to render. |
| `keyExtractor` | `(item, index) => string` | required | Stable, unique key per item. |
| `renderItem` | `(item, index, layout) => ReactElement` | required | Renders one cell. `layout` is `{width, columnIndex, numColumns}`. |
| `numColumns` | `number` | `1` | Columns in the grid. |
| `columnGap` | `number` | `0` | Horizontal space between columns. |
| `rowGap` | `number` | `0` | Vertical space between rows. |
| `itemAspectRatio` | `number` | | Forces width ÷ height on every cell. Omit to let content set the height. |
| `onItemPress` | `(item, index) => void` | | Makes each cell pressable. |
| `onItemVisibilityChange` | `(item, index, isVisible) => void` | | Fires as items enter or leave the viewport. |
| `getItemType` | `(item, index) => string \| number` | | Groups cells that look alike, so FlashList can recycle them better. |
| `drawDistance` | `number` | `1200` | Pixels beyond the viewport that are pre-rendered. |
| `loading` | `boolean` | `false` | Shows skeleton cells instead of `data`. |
| `skeletonCount` | `number` | `numColumns × 3` | Number of skeleton cells while loading. |
| `renderSkeleton` | `(index, layout) => ReactElement` | `KPSkeleton` | Custom skeleton cell. |
| `error` | `unknown` | | Shown only when `data` is empty. |
| `renderError` | `(error) => ReactElement \| null` | | Renders the error state. |
| `ListEmptyComponent` | `ReactElement \| null` | | Shown when `data` is empty and there is no error. |
| `style` / `contentContainerStyle` | `StyleProp<ViewStyle>` | | Styling for the list and its content. |
| `testID` | `string` | | Test identifier. |
| `listProps` | FlashList props | | Passed through to FlashList: pull-to-refresh, `onEndReached`, headers and footers, and so on. Owned props are excluded from the type. |

## `KPImage` props

| Prop | Type | Description |
|---|---|---|
| `source` | `{uri, headers?} \| number \| null` | Remote or bundled image. `null` shows `fallback`. |
| `aspectRatio` | `number` | Reserves space before the image loads. |
| `resizeMode` | `'cover' \| 'contain' \| 'stretch' \| 'center'` | Default `'cover'`. |
| `placeholder` | `ReactElement \| null` | Shown while loading. Defaults to `KPSkeleton`. `null` shows nothing. |
| `fallback` | `ReactElement \| null` | Shown when the source is missing or fails to load. |
| `onLoad` / `onError` | callbacks | Called with the image size or the error message. |

Format is decided by the native decoder, not by the URL extension. Loading and error state are tied to the source, so a recycled cell that receives a new image starts in the loading state and ignores late events from the previous one.

`KPSkeleton` is also exported, so you can use it on its own.

## Behaviour notes

- Cells hold no state of their own. FlashList controls mounting, recycling and measuring.
- Recycling does not cancel in-flight network requests. The native image backend decides that.
- Keep `renderItem`, `keyExtractor` and `onItemPress` stable (`useCallback`). Cells are memoized and re-render only when their inputs change.
- Masonry, prefetching and pagination helpers are not included. Pagination works through `listProps.onEndReached`.

## Development

```sh
yarn install
yarn typecheck
yarn lint
yarn test
yarn build          # writes lib/ (ES modules + .d.ts)
```

The `example/` app imports the library source directly through Metro. It is a development harness and is not part of the published package.

```sh
yarn example:start
yarn example:ios
yarn example:android
```

## Versioning

Semantic versioning. Changes are listed in [CHANGELOG.md](CHANGELOG.md).
