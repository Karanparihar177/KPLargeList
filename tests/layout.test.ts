import {
  getCellPadding,
  getItemWidth,
  sanitizeColumns,
} from '../src/utils/layout';

describe('layout', () => {
  it.each([1, 2, 3, 4])(
    'item widths + gaps fill the container for %d columns',
    n => {
      const W = 400;
      const g = 12;
      const w = getItemWidth(W, n, g);
      expect(w * n + g * (n - 1)).toBeCloseTo(W);
    },
  );

  it('uses the supplied container width, not a fixed screen width', () => {
    expect(getItemWidth(300, 3, 0)).toBe(100);
    expect(getItemWidth(600, 3, 0)).toBe(200);
    expect(getItemWidth(0, 3, 8)).toBe(0);
  });

  it('cell padding yields exactly `gap` between neighbours and none on the outer edges', () => {
    const n = 4;
    const g = 10;
    const pads = [0, 1, 2, 3].map(i => getCellPadding(i, n, g, 6));
    expect(pads[0].paddingLeft).toBe(0);
    expect(pads[n - 1].paddingRight).toBe(0);
    for (let i = 0; i < n - 1; i++) {
      expect(pads[i].paddingRight + pads[i + 1].paddingLeft).toBeCloseTo(g);
    }
  });

  it('row gap applies from the second row on', () => {
    expect(getCellPadding(1, 2, 0, 8).paddingTop).toBe(0);
    expect(getCellPadding(2, 2, 0, 8).paddingTop).toBe(8);
  });

  it('sanitizes invalid column counts', () => {
    expect(sanitizeColumns(undefined)).toBe(1);
    expect(sanitizeColumns(0)).toBe(1);
    expect(sanitizeColumns(-3)).toBe(1);
    expect(sanitizeColumns(2.9)).toBe(2);
  });
});
