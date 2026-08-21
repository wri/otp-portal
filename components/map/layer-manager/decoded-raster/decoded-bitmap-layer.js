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
 * Only the numeric decode params become GLSL uniforms — the rest of `decodeParams` is timeline UI
 * config (date strings, colours, flags). The declarations in `getShaders()` and the values in
 * `draw()` have to stay in lockstep, so both derive them here.
 */
function getDecodeUniforms(decodeParams = {}) {
  return Object.fromEntries(
    Object.entries(decodeParams).filter(([, value]) => typeof value === 'number')
  );
}

// Which uniforms the shader was compiled with. The names are baked into the source, so a change
// here means the shader is stale.
export const getUniformSignature = (decodeParams) =>
  Object.keys(getDecodeUniforms(decodeParams)).sort().join(',');

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
   * deck.gl calls this once, when the model is built, so the declared uniforms are whatever
   * `decodeParams` held at that moment — see `updateState` for how a later change is handled.
   */
  getShaders() {
    const { decodeParams = {}, decodeFunction = '' } = this.props;

    const uniformDeclarations = Object.keys(getDecodeUniforms(decodeParams))
      .map((key) => `uniform float ${key};`)
      .join('\n');

    const fs = fragmentShader
      .replace('{decodeParams}', uniformDeclarations)
      .replace('{decodeFunction}', decodeFunction);

    return { ...super.getShaders(), fs };
  }

  /**
   * Rebuild the model when the set of decode params changes shape, because `getShaders()` writes
   * the uniform names straight into the fragment shader source.
   *
   * `integrated-alerts` is why this matters: it has no static startDate/endDate defaults, so its
   * `startDayIndex` / `endDayIndex` only exist once the metadata fetch resolves. A shader compiled
   * before then would read uniforms it never declared and fail for good — leaving the layer
   * silently blank — with no way back, since deck would otherwise keep the stale model forever.
   */
  updateState(params) {
    super.updateState(params);

    const signature = getUniformSignature(this.props.decodeParams);
    if (this.state.uniformSignature === signature) return;

    // On the first pass super.updateState has just built the model with the right shader already
    if (this.state.uniformSignature !== undefined) {
      const { gl } = this.context;

      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager().invalidateAll();
    }

    this.setState({ uniformSignature: signature });
  }

  draw(opts) {
    const { decodeParams = {} } = this.props;

    // The decode functions scale their output by zoom. layer-manager fed them
    // `floor(viewport.zoom) + 1` from its own tile layer; keep that exact expression.
    const zoom = Math.floor(this.context.viewport.zoom) + 1;

    super.draw({
      ...opts,
      uniforms: { ...opts.uniforms, ...getDecodeUniforms(decodeParams), zoom }
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
