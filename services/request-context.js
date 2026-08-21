import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage();

export const runWithRequestCookie = (cookie, fn) => als.run({ cookie }, fn);

export const getRequestCookie = () => als.getStore()?.cookie;
