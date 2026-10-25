import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KPLargeList} from '../src';
import type {KPRenderItem} from '../src';

// Deliberately not a "product": proves the component is data-agnostic.
interface Video {
  id: string;
  duration: number;
}
interface User {
  login: string;
}

const videos: Video[] = Array.from({length: 6}, (_, i) => ({id: `v${i}`, duration: i}));

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  // Unmount so skeleton animation loops stop.
  mounted.splice(0).forEach(r => act(() => r.unmount()));
});

async function render(el: React.ReactElement) {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(el);
  });
  mounted.push(r);
  return r;
}
const skeletons = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAll(n => n.props.testID === 'kp-skeleton' && typeof n.type === 'string');
const texts = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAllByType(Text).map(t => t.props.children);

describe('KPLargeList', () => {
  const renderVideo: KPRenderItem<Video> = v => <Text>{v.id}</Text>;

  it('renders items via the custom renderer and generic data types', async () => {
    const r = await render(
      <KPLargeList data={videos} keyExtractor={v => v.id} renderItem={renderVideo} />,
    );
    expect(texts(r)).toEqual(expect.arrayContaining(['v0', 'v1']));
  });

  it('works with a different item type (type-level + runtime)', async () => {
    const users: readonly User[] = [{login: 'a'}, {login: 'b'}];
    const r = await render(
      <KPLargeList
        data={users}
        keyExtractor={u => u.login}
        renderItem={u => <Text>{u.login}</Text>}
        onItemPress={u => u.login.toUpperCase()}
      />,
    );
    expect(texts(r)).toEqual(['a', 'b']);
  });

  it('passes stable keys from keyExtractor', async () => {
    const keyExtractor = jest.fn((v: Video, _i: number) => v.id);
    await render(<KPLargeList data={videos} keyExtractor={keyExtractor} renderItem={renderVideo} />);
    expect(keyExtractor).toHaveBeenCalledWith(videos[0], 0);
    expect(new Set(videos.map(v => keyExtractor(v, 0))).size).toBe(videos.length);
  });

  it.each([1, 2, 3, 4])('lays out %d column(s) and reports column index', async n => {
    const cols: number[] = [];
    await render(
      <KPLargeList
        data={videos}
        numColumns={n}
        columnGap={8}
        rowGap={8}
        keyExtractor={v => v.id}
        renderItem={(v, i, layout) => {
          cols[i] = layout.columnIndex;
          expect(layout.numColumns).toBe(n);
          return <Text>{v.id}</Text>;
        }}
      />,
    );
    expect(cols[0]).toBe(0);
    if (n > 1) {
      expect(cols[1]).toBe(1);
    }
  });

  it('fires onItemPress with item and index', async () => {
    const onItemPress = jest.fn();
    const r = await render(
      <KPLargeList
        data={videos}
        keyExtractor={v => v.id}
        renderItem={renderVideo}
        onItemPress={onItemPress}
      />,
    );
    const pressables = r.root.findAll(
      n => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function',
    );
    expect(pressables.length).toBeGreaterThan(1);
    const target = pressables[1];
    act(() => target.props.onPress());
    expect(onItemPress).toHaveBeenCalledWith(videos[1], 1);
  });

  it('shows the empty state for empty data', async () => {
    const r = await render(
      <KPLargeList
        data={[] as Video[]}
        keyExtractor={v => v.id}
        renderItem={renderVideo}
        ListEmptyComponent={<Text>nothing</Text>}
      />,
    );
    expect(texts(r)).toEqual(['nothing']);
  });

  it('shows the error state only when there is no data', async () => {
    const props = {keyExtractor: (v: Video) => v.id, renderItem: renderVideo, error: new Error('boom'), renderError: (e: unknown) => <Text>{(e as Error).message}</Text>};
    const empty = await render(<KPLargeList data={[]} {...props} />);
    expect(texts(empty)).toEqual(['boom']);
    const withData = await render(<KPLargeList data={videos} {...props} />);
    expect(texts(withData)).not.toContain('boom');
  });

  it('renders skeletons instead of data while loading, then the data', async () => {
    const r = await render(
      <KPLargeList data={videos} loading skeletonCount={4} keyExtractor={v => v.id} renderItem={renderVideo} />,
    );
    expect(skeletons(r).length).toBeGreaterThan(0);
    expect(texts(r)).not.toContain('v0');
    await act(async () => {
      r.update(<KPLargeList data={videos} keyExtractor={v => v.id} renderItem={renderVideo} />);
    });
    expect(skeletons(r).length).toBe(0);
    expect(texts(r)).toContain('v0');
  });

  it('uses a custom skeleton renderer', async () => {
    const r = await render(
      <KPLargeList
        data={[]}
        loading
        skeletonCount={2}
        renderSkeleton={i => <Text>{`sk${i}`}</Text>}
        keyExtractor={(v: Video) => v.id}
        renderItem={renderVideo}
      />,
    );
    expect(texts(r)).toEqual(expect.arrayContaining(['sk0']));
  });

  it('re-renders with new data (changing datasets)', async () => {
    const r = await render(<KPLargeList data={videos} keyExtractor={v => v.id} renderItem={renderVideo} />);
    await act(async () => {
      r.update(<KPLargeList data={[{id: 'x', duration: 1}]} keyExtractor={v => v.id} renderItem={renderVideo} />);
    });
    expect(texts(r)).toEqual(['x']);
  });

  it('does not re-render unchanged items when unrelated props change', async () => {
    const renders = jest.fn();
    const renderItem: KPRenderItem<Video> = v => {
      renders(v.id);
      return <Text>{v.id}</Text>;
    };
    const keyExtractor = (v: Video) => v.id;
    const r = await render(<KPLargeList data={videos} keyExtractor={keyExtractor} renderItem={renderItem} />);
    const before = renders.mock.calls.length;
    await act(async () => {
      r.update(<KPLargeList data={videos} keyExtractor={keyExtractor} renderItem={renderItem} testID="x" />);
    });
    expect(renders.mock.calls.length).toBe(before);
  });
});
