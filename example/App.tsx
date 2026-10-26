import React, {useCallback, useMemo, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {KPImage, KPLargeList} from 'kp-large-list';
import type {KPRenderItem} from 'kp-large-list';
import {makeItems} from './demo/data';
import type {DemoItem} from './demo/data';

interface Scenario {
  label: string;
  count: number;
  columns: number;
  gap: number;
}

const SCENARIOS: Scenario[] = [
  {label: '2 col · 6', count: 6, columns: 2, gap: 12},
  {label: '3 col · 12', count: 12, columns: 3, gap: 8},
  {label: '4 col · 12', count: 12, columns: 4, gap: 6},
  {label: '1 col · list', count: 30, columns: 1, gap: 12},
  {label: '2 col · 100', count: 100, columns: 2, gap: 8},
  {label: '3 col · 600', count: 600, columns: 3, gap: 8},
];

const fallbackAsset = require('./assets/fallback.png');

function Fallback() {
  return (
    <View style={styles.fallback}>
      <Image source={fallbackAsset} style={styles.fallbackImg} />
    </View>
  );
}

function Card({
  item,
  ratio,
  compact,
}: {
  item: DemoItem;
  ratio: number;
  compact: boolean;
}) {
  return (
    <View style={styles.card}>
      <KPImage
        source={item.imageUri ? {uri: item.imageUri} : null}
        aspectRatio={ratio}
        fallback={<Fallback />}
        accessibilityLabel={item.title}
      />
      <Text numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>
      {compact ? null : <Text style={styles.sub}>{item.subtitle}</Text>}
    </View>
  );
}

function Row({item}: {item: DemoItem}) {
  return (
    <View style={styles.row}>
      <KPImage
        source={item.imageUri ? {uri: item.imageUri} : null}
        aspectRatio={1}
        style={styles.thumb}
        fallback={<Fallback />}
      />
      <View style={styles.rowText}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

function Demo() {
  const insets = useSafeAreaInsets();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [broken, setBroken] = useState(true);
  const [pressed, setPressed] = useState<string>('none');
  const [visible, setVisible] = useState(0);
  const [drawFar, setDrawFar] = useState(true);

  const s = SCENARIOS[scenarioIdx];
  const data = useMemo(
    () => (empty || failed ? [] : makeItems(s.count, broken ? 7 : 0, mixed)),
    [s.count, empty, failed, broken, mixed],
  );

  const renderItem = useCallback<KPRenderItem<DemoItem>>(
    (item, _i, layout) =>
      layout.numColumns === 1 ? (
        <Row item={item} />
      ) : (
        <Card item={item} ratio={item.ratio} compact={layout.numColumns >= 4} />
      ),
    [],
  );
  const keyExtractor = useCallback((i: DemoItem) => i.id, []);
  const onItemPress = useCallback((item: DemoItem) => setPressed(item.id), []);
  const onVisible = useCallback(
    (_item: DemoItem, _i: number, isVisible: boolean) =>
      setVisible(v => Math.max(0, v + (isVisible ? 1 : -1))),
    [],
  );

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <ScrollView
        horizontal
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {SCENARIOS.map((sc, i) => (
          <Pressable
            key={sc.label}
            onPress={() => setScenarioIdx(i)}
            style={[styles.tab, i === scenarioIdx && styles.tabOn]}
          >
            <Text style={i === scenarioIdx ? styles.tabTextOn : styles.tabText}>
              {sc.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.toggles}>
        {(
          [
            ['loading', loading, setLoading],
            ['empty', empty, setEmpty],
            ['error', failed, setFailed],
            ['mixed ratios', mixed, setMixed],
            ['broken urls', broken, setBroken],
            ['pre-render far', drawFar, setDrawFar],
          ] as const
        ).map(([label, value, set]) => (
          <View key={label} style={styles.toggle}>
            <Text style={styles.sub}>{label}</Text>
            <Switch value={value} onValueChange={set} />
          </View>
        ))}
      </View>
      <Text style={styles.status}>
        pressed: {pressed} · visible cells: {visible}
      </Text>
      <KPLargeList
        style={styles.list}
        data={data}
        loading={loading}
        error={failed ? new Error('Could not load items') : undefined}
        renderError={e => (
          <Text style={styles.msg}>{(e as Error).message}</Text>
        )}
        ListEmptyComponent={<Text style={styles.msg}>Nothing here yet</Text>}
        numColumns={s.columns}
        drawDistance={drawFar ? 1200 : 250}
        columnGap={s.gap}
        rowGap={s.gap}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onItemPress={onItemPress}
        onItemVisibilityChange={onVisible}
        contentContainerStyle={styles.content}
        skeletonCount={s.columns * 3}
        itemAspectRatio={undefined}
        listProps={{
          decelerationRate: 'fast',
        }}
      />
    </View>
  );
}

export default function App() {
  const dark = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Demo />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff'},
  tabs: {flexGrow: 0},
  tabsContent: {padding: 8, gap: 8},
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#eef0f3',
  },
  tabOn: {backgroundColor: '#1f6feb'},
  tabText: {color: '#24292f'},
  tabTextOn: {color: '#fff', fontWeight: '600'},
  toggles: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8},
  toggle: {flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 8},
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    color: '#57606a',
    fontSize: 12,
  },
  list: {flex: 1},
  content: {padding: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d7de',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#24292f',
    padding: 6,
    paddingBottom: 0,
  },
  sub: {fontSize: 11, color: '#57606a', padding: 6},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  thumb: {width: 72, borderRadius: 8},
  rowText: {flex: 1},
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebedf0',
  },
  fallbackImg: {width: '50%', height: '50%', resizeMode: 'contain'},
  msg: {textAlign: 'center', padding: 32, color: '#57606a'},
});
