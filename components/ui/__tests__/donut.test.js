import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import Donut from 'components/ui/donut';

const data = [
  { name: 'a', value: 1, fill: '#111' },
  { name: 'b', value: 0, fill: '#222' },
  { name: 'c', value: 3, fill: '#333', stroke: '#333' }
];

describe('Donut', () => {
  it('renders on the server, skipping empty segments', () => {
    const html = renderToStaticMarkup(<Donut data={data} innerRatio={0.5} />);

    expect(html.match(/<path /g)).toHaveLength(2);
    expect(html).toContain('fill="#111" stroke="#fff"');
    expect(html).toContain('fill="#333" stroke="#333"');
    expect(html).not.toContain('<mask');
  });

  it('places labels outside the ring in the slice colour', () => {
    const html = renderToStaticMarkup(
      <Donut data={data} innerRatio={0.5} formatLabel={({ name, value }) => `${name}: ${value}`} />
    );

    expect(html).toContain('>a: 1</span>');
    expect(html).toContain('>c: 3</span>');
    expect(html).not.toContain('b: 0');
    // "a" is a quarter turn centred on 1:30, so its label sits up and to the right
    expect(html).toMatch(/left:(7[0-9]|8[0-9])\.[0-9]+%;top:(1[0-9]|2[0-9])\.[0-9]+%;transform:translate\(0%, -8[0-9]\.[0-9]+%\);text-align:left;color:#111/);
  });

  it('masks the ring with a sweep when animated', () => {
    const html = renderToStaticMarkup(<Donut data={data} innerRatio={0.5} animate />);
    const id = html.match(/<mask id="([^"]+)"/)[1];

    expect(id).not.toContain(':');
    expect(html).toContain(`mask="url(#${id})"`);
    expect(html).toContain('class="c-donut -animate"');
  });
});
