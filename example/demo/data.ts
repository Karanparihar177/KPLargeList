import products from './products.json';

export interface DemoItem {
  id: string;
  title: string;
  subtitle: string;
  imageUri: string | null;
  /** width / height of the image */
  ratio: number;
  /** what the URL is expected to do; handy when eyeballing the demo */
  kind: 'webp' | 'png' | 'jpeg' | 'avif' | 'broken';
}

// URLs below were requested with curl on 2026-10-24 and returned the listed
// content types (see README "Image providers"). Broken ones fail on purpose.
const WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Fronalpstock_big.jpg/500px-Fronalpstock_big.jpg';
const AVIF = 'https://raw.githubusercontent.com/link-u/avif-sample-images/master/fox.profile0.8bpc.yuv420.avif';
const BROKEN = [
  'https://placehold.co/this/does/not/exist.png', // non-200
  'https://example.com/', // 200 but HTML, not an image
  'https://does-not-exist.invalid/x.jpg', // DNS failure
];

const SIZES: ReadonlyArray<[number, number]> = [
  [400, 400],
  [400, 300],
  [300, 400],
  [400, 500],
  [600, 400],
];

function build(i: number, brokenEvery: number): Pick<DemoItem, 'imageUri' | 'ratio' | 'kind'> {
  if (brokenEvery > 0 && i % brokenEvery === brokenEvery - 1) {
    return {imageUri: BROKEN[Math.floor(i / brokenEvery) % BROKEN.length], ratio: 1, kind: 'broken'};
  }
  const [w, h] = SIZES[i % SIZES.length];
  switch (i % 5) {
    case 0:
      return {imageUri: products[i % products.length].thumbnail, ratio: 1, kind: 'webp'};
    case 1:
      return {imageUri: `https://placehold.co/${w}x${h}/png?text=${i}`, ratio: w / h, kind: 'png'};
    case 2:
      return {imageUri: `https://placehold.co/${w}x${h}.jpeg?text=${i}`, ratio: w / h, kind: 'jpeg'};
    case 3:
      return i % 10 === 3
        ? {imageUri: AVIF, ratio: 1, kind: 'avif'}
        : {imageUri: WIKI, ratio: 1.5, kind: 'jpeg'};
    default:
      return {imageUri: `https://placehold.co/${w}x${h}.webp?text=${i}`, ratio: w / h, kind: 'webp'};
  }
}

/** Deterministic: the same (count, brokenEvery) always yields the same ids and URLs. */
export function makeItems(count: number, brokenEvery = 0, mixedRatios = false): DemoItem[] {
  return Array.from({length: count}, (_, i) => {
    const img = build(i, brokenEvery);
    const p = products[i % products.length];
    return {
      id: `item-${i}`,
      title: p.title,
      subtitle: `#${i} · ${img.kind}`,
      ...img,
      ratio: mixedRatios ? img.ratio : 1,
    };
  });
}
