// Only the slices every page needs (header, menus, search). Page-specific slices register
// themselves through modules/registry.js when a page imports them.
export { default as countries } from './countries';
export { default as language } from './language';
export { default as operators } from './operators';
export { default as user } from './user';
export { default as notifications } from './notifications';
export { default as search } from './search';
