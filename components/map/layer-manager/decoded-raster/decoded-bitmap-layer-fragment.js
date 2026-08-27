/**
 * Fragment shader for `DecodedBitmapLayer`.
 *
 * `{decodeParams}` is replaced with one `uniform float` per numeric decode param and
 * `{decodeFunction}` with the layer's GLSL snippet, which reads/writes the `color` and `alpha`
 * locals. Kept deliberately close to layer-manager's original so the snippets in
 * `constants/layers.js` port over untouched.
 *
 * The uniforms deck.gl's own BitmapLayer sets are declared even where unused, so the shader
 * stays a drop-in for `BitmapLayer.draw()`.
 */
export default `
#define SHADER_NAME decoded-bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

varying vec2 vTexCoord;
varying vec2 vTexPos;

uniform float desaturate;
uniform vec4 transparentColor;
uniform vec3 tintColor;
uniform float opacity;
uniform float coordinateConversion;
uniform vec4 bounds;

uniform float zoom;

{decodeParams}

vec4 decode(vec3 color, float alpha) {
  {decodeFunction}
  return vec4(color, alpha * opacity);
}

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  // clear mask
  if (bitmapColor == vec4(0., 0., 0., 1.)) {
    discard;
  }

  gl_FragColor = decode(bitmapColor.rgb, bitmapColor.a);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
