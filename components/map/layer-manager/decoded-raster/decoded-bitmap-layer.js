import GL from '@luma.gl/constants';
import { BitmapLayer } from '@deck.gl/layers';

import fragmentShader from './decoded-bitmap-layer-fragment';

// deck.gl defaults to LINEAR_MIPMAP_LINEAR, which interpolates between texels. That is right for
// photographic imagery and wrong here: these texels are encoded values, so a blend of two of them
// decodes to a day number and a confidence level that were never in the data.
const DATA_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

/**
 * A BitmapLayer whose fragment shader runs a layer-supplied GLSL snippet over every texel.
 *
 * The GFW raster tiles this renders (`loss`, `integrated-alerts`) encode data — dates,
 * confidence, intensity — in their RGBA channels rather than colours, so they have to be decoded
 * on the GPU before being drawn. `decodeFunction` is that snippet, `decodeParams` are the
 * uniforms it reads, both defined per layer in `constants/layers.js`.
 *
 * Replaces layer-manager's vendored copy of deck.gl's BitmapLayer (which predated
 * `@deck.gl/layers` exposing one that handles image loading, textures and bounds itself).
 */
export default class DecodedBitmapLayer extends BitmapLayer {
  /**
   * KNOWN LIMITATION: deck.gl calls this once, when the model is built, so the uniforms declared
   * here are whatever `decodeParams` happened to hold at that moment. A param that shows up later
   * is never declared, and a `decodeFunction` reading it fails to compile for good.
   *
   * `integrated-alerts` is the layer at risk — it has no static startDate/endDate defaults, so its
   * `startDayIndex` / `endDayIndex` only exist once the metadata fetch resolves. It works today
   * only because `modules/operators-ranking.js` (and its operators-detail twin) dispatch the layer
   * settings before adding the layer to `layersActive`. If that ordering is ever reversed, the
   * layer goes silently blank. Fix would be to key the deck layer's recreation in
   * `./index.js` on the declared-uniform signature.
   */
  getShaders() {
    const { decodeParams = {}, decodeFunction = '' } = this.props;

    const uniformDeclarations = Object.keys(decodeParams)
      .filter((key) => typeof decodeParams[key] === 'number')
      .map((key) => `uniform float ${key};`)
      .join('\n');

    const fs = fragmentShader
      .replace('{decodeParams}', uniformDeclarations)
      .replace('{decodeFunction}', decodeFunction);

    return { ...super.getShaders(), fs };
  }

  draw(opts) {
    const { decodeParams = {} } = this.props;

    // The decode functions scale their output by zoom. layer-manager fed them
    // `floor(viewport.zoom) + 1` from its own tile layer; keep that exact expression.
    const zoom = Math.floor(this.context.viewport.zoom) + 1;

    const decodeUniforms = Object.keys(decodeParams)
      .filter((key) => typeof decodeParams[key] === 'number')
      .reduce((acc, key) => ({ ...acc, [key]: decodeParams[key] }), {});

    super.draw({
      ...opts,
      uniforms: { ...opts.uniforms, ...decodeUniforms, zoom }
    });
  }
}

DecodedBitmapLayer.layerName = 'DecodedBitmapLayer';

DecodedBitmapLayer.defaultProps = {
  ...BitmapLayer.defaultProps,
  textureParameters: { type: 'object', value: DATA_TEXTURE_PARAMETERS, ignore: true },
  decodeParams: { type: 'object', value: {}, compare: true },
  decodeFunction: { type: 'string', value: '', compare: true }
};
