import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KPImage} from '../src';

// Stand-in backend that exposes the load/error callbacks to the test.
jest.mock('../src/adapters/FastImageAdapter', () => {
  const {View: V} = require('react-native');
  return {FastImageAdapter: (p: object) => <V {...p} testID="backend" />};
});

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
const backend = (r: ReactTestRenderer.ReactTestRenderer) => r.root.findAll(n => n.props.testID === 'backend' && typeof n.type === 'string')[0];
const skeleton = (r: ReactTestRenderer.ReactTestRenderer) => r.root.findAll(n => n.props.testID === 'kp-skeleton' && typeof n.type === 'string');
const fallbackEl = <Text>fallback</Text>;

describe('KPImage', () => {
  it('shows a skeleton until the image loads', async () => {
    const r = await render(<KPImage source={{uri: 'https://a/1'}} aspectRatio={1} />);
    expect(skeleton(r).length).toBe(1);
    act(() => backend(r).props.onLoad({width: 10, height: 10}));
    expect(skeleton(r).length).toBe(0);
  });

  it('shows the fallback on error and reports it', async () => {
    const onError = jest.fn();
    const r = await render(<KPImage source={{uri: 'https://bad'}} fallback={fallbackEl} onError={onError} />);
    act(() => backend(r).props.onError('404'));
    expect(onError).toHaveBeenCalledWith('404');
    expect(r.root.findAllByType(Text).map(t => t.props.children)).toContain('fallback');
    expect(r.root.findAll(n => n.props.testID === 'backend').length).toBe(0);
  });

  it('shows the fallback when there is no source', async () => {
    const r = await render(<KPImage source={null} fallback={fallbackEl} />);
    expect(r.root.findAllByType(Text).map(t => t.props.children)).toContain('fallback');
  });

  it('resets to loading when the source changes (recycled cell), never showing stale state', async () => {
    const r = await render(<KPImage source={{uri: 'https://a/1'}} fallback={fallbackEl} />);
    act(() => backend(r).props.onLoad({width: 1, height: 1}));
    expect(skeleton(r).length).toBe(0);

    await act(async () => r.update(<KPImage source={{uri: 'https://a/2'}} fallback={fallbackEl} />));
    expect(skeleton(r).length).toBe(1);
    expect(backend(r).props.recyclingKey).toBe('https://a/2');

    act(() => backend(r).props.onError('x'));
    await act(async () => r.update(<KPImage source={{uri: 'https://a/3'}} fallback={fallbackEl} />));
    // previous item's error must not carry over
    expect(r.root.findAllByType(Text)).toHaveLength(0);
    expect(backend(r).props.source.uri).toBe('https://a/3');
  });

  it('ignores a late load event from the previous source', async () => {
    const r = await render(<KPImage source={{uri: 'https://a/1'}} />);
    const staleOnLoad = backend(r).props.onLoad;
    await act(async () => r.update(<KPImage source={{uri: 'https://a/2'}} />));
    act(() => staleOnLoad({width: 1, height: 1}));
    expect(skeleton(r).length).toBe(1);
  });

  it('forwards headers and resize mode and works standalone', async () => {
    const r = await render(
      <View>
        <KPImage source={{uri: 'https://a/1', headers: {Authorization: 'x'}}} resizeMode="contain" />
      </View>,
    );
    expect(backend(r).props.source.headers).toEqual({Authorization: 'x'});
    expect(backend(r).props.resizeMode).toBe('contain');
  });
});
