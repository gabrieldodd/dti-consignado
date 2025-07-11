// src/hooks/useCookies.ts
import { useCallback } from 'react';
import { CookieManager } from '../types/Common';

export const useCookies = (): CookieManager => {
  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string, days: number = 7): void => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
  }, []);

  const removeCookie = useCallback((name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }, []);

  return { getCookie, setCookie, removeCookie };
};