import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import Icon, { IconSymbols } from 'components/ui/icon';
import { ICONS } from 'components/ui/icons';

describe('Icon', () => {
  it('references a shared symbol by default', () => {
    const html = renderToStaticMarkup(<Icon name="icon-arrow-down" className="-small" />);

    expect(html).toBe('<svg class="c-icon -small"><use xlink:href="#icon-arrow-down"></use></svg>');
  });

  it.each(Object.keys(ICONS))('draws %s itself when inline', (name) => {
    const html = renderToStaticMarkup(<Icon name={name} inline />);

    expect(html).toContain(`viewBox="${ICONS[name].viewBox}"`);
    expect(html).toContain(`<path d="${ICONS[name].paths[0]}"`);
    expect(html).not.toContain('<use');
  });

  it('falls back to a reference for a name with no shape', () => {
    expect(renderToStaticMarkup(<Icon name="icon-nope" inline />)).toContain('xlink:href="#icon-nope"');
  });
});

describe('IconSymbols', () => {
  it('renders nothing on the server, keeping the shapes out of the HTML', () => {
    expect(renderToStaticMarkup(<IconSymbols />)).toBe('');
  });
});
