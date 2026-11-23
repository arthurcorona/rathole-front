import { isAxiosError } from 'axios';

/** Mensagem que o back mandou em `{ message }`, ou o texto padrão. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export const isNotFound = (err: unknown) => isAxiosError(err) && err.response?.status === 404;
