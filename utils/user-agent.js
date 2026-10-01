// Phones only: tablets fall through to the desktop layout. Old iPads send "Mobile/…",
// and Android tablets omit "Mobile", so iPad/Tablet are excluded explicitly.
const MOBILE = /Mobi|iPhone|iPod|Windows Phone|BlackBerry|BB10|Opera Mini|IEMobile/i;
const TABLET = /iPad|Tablet|PlayBook|Silk|Kindle/i;

export function isMobileUserAgent(ua) {
  if (!ua) return false;
  return MOBILE.test(ua) && !TABLET.test(ua);
}
