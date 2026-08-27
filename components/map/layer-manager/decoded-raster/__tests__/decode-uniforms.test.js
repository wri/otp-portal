import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';

import { LAYERS } from 'constants/layers';
import { getParams } from 'selectors/utils';

import { clampZoom, getUniformSignature } from '../decoded-bitmap-layer';

const findLayer = (id) => LAYERS.find((l) => l.id === id);

const decodeParamsFor = (layer, settings = {}) =>
  getParams(layer.decodeConfig, {
    ...layer.timelineConfig,
    ...settings.decodeParams,
    ...settings.timelineParams
  });

describe('decode uniform signature', () => {
  it('only counts numbers — the rest of decodeParams is timeline UI config', () => {
    expect(
      getUniformSignature({
        startYear: 2001,
        startDate: '2001-01-01',
        canPlay: true,
        railStyle: { background: '#DDD' },
        trackStyle: [{ background: '#dc6c9a' }]
      })
    ).toBe('startYear');
  });

  it('is order-independent, so a reshuffled params object does not force a rebuild', () => {
    expect(getUniformSignature({ a: 1, b: 2 })).toBe(getUniformSignature({ b: 2, a: 1 }));
  });

  it('is stable for loss, which carries static date defaults', () => {
    const loss = findLayer('loss');

    expect(getUniformSignature(decodeParamsFor(loss))).toBe(
      getUniformSignature(
        decodeParamsFor(loss, { decodeParams: { startDate: '2005-01-01', endDate: '2010-12-31' } })
      )
    );
  });

  it('changes for integrated-alerts once the metadata fetch resolves', () => {
    // This is the case the model rebuild in updateState exists for: the GLSL reads startDayIndex
    // and endDayIndex, which getParams can only derive once maxDate arrives from the API.
    const alerts = findLayer('integrated-alerts');

    const before = decodeParamsFor(alerts);
    expect(before.startDayIndex).toBeUndefined();
    expect(alerts.decodeFunction).toContain('startDayIndex');

    const maxDataDate = '2026-08-01';
    const after = decodeParamsFor(alerts, {
      decodeParams: {
        startDate: dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD'),
        endDate: maxDataDate,
        trimEndDate: maxDataDate,
        maxDate: maxDataDate
      },
      timelineParams: { maxDate: maxDataDate, minDataDate: '2014-12-31' }
    });

    expect(typeof after.startDayIndex).toBe('number');
    expect(getUniformSignature(after)).not.toBe(getUniformSignature(before));
  });
});

describe('decode zoom', () => {
  it('stays inside the source zoom range, so overzoomed tiles decode as their own level', () => {
    // `loss` reads `zoom < 13.` to pick its encoding; its tiles stop at 12
    expect(clampZoom(13, 3, 12)).toBe(12);
    expect(clampZoom(20, 3, 12)).toBe(12);
    expect(clampZoom(2, 3, 12)).toBe(3);
    expect(clampZoom(8, 3, 12)).toBe(8);
  });

  it('leaves zoom alone when the source declares no bounds', () => {
    expect(clampZoom(18, 0, null)).toBe(18);
  });
});
