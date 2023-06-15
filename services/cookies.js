export const setCookie = (key, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${key}=${value}${expires}; path=/`;
}

export const getCookie = (key) => {
  if (!key) return null;
  try {
    return document.cookie.split('; ').find((row) => row.startsWith(`${key}=`))?.split('=')[1];
  } catch (err) {
    return null;
  }
}

export const deleteCookie = (key) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
