// src/hooks/useCookies.ts
import { useCallback } from 'react';
import { CookieManager } from '../types/Common';

/**
 * Hook para gerenciar cookies
 */
export const useCookies = (): CookieManager => {
  const setCookie = useCallback((name: string, value: string, days: number = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }, []);

  const getCookie = useCallback((name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }, []);

  const deleteCookie = useCallback((name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }, []);

  return { setCookie, getCookie, deleteCookie };
};