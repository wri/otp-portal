import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage();

export const runWithRequest = (headers = {}, fn) =>
  als.run({ cookie: headers.cookie, forwardedFor: headers['x-forwarded-for'] }, fn);

export const getRequestCookie = () => als.getStore()?.cookie;

export const getRequestForwardedFor = () => als.getStore()?.forwardedFor;
