export const setCookie = (key, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${key}=${value}${expires}; path=/`;
}

export const getCookie = (key, cookieString) => {
  if (!key) return null;
  try {
    const source = cookieString ?? (typeof document !== 'undefined' ? document.cookie : '');
    const match = source.split('; ').find((row) => row.startsWith(`${key}=`));
    // slice (not split('=')) so values containing '=' (e.g. base64 padding) survive
    return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
  } catch (err) {
    return null;
  }
}

export const deleteCookie = (key) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
