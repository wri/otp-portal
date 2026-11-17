// Only the language is still global: the remaining page slices' requests read the locale from it.
// Page-specific slices register themselves through modules/registry.js when a page imports them.
export { default as language } from './language';
