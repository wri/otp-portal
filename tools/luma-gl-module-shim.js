// @luma.gl/webgl 7.3.2 opens an ESM file with `var m = module` to hide a Node-only
// require('gl') from bundlers. Webpack still bound `module` there; Turbopack evaluates
// it as real ESM, so it throws and takes the whole _app chunk down with it.
// headless-gl isn't installed, so returning null matches what the lookup already did.
const NEEDLE = 'var m = module;';

module.exports = function lumaGlModuleShim(source) {
  if (!source.includes(NEEDLE)) {
    this.emitWarning(new Error('luma-gl-module-shim: `var m = module;` not found - did @luma.gl/webgl change?'));
    return source;
  }
  return source.replace(NEEDLE, 'var m = { require: function () { return null; } };');
};
