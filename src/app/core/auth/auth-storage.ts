export const AUTH_TOKEN_KEY = 'ed_mobile_token';
export const AUTH_USER_KEY = 'ed_mobile_user';

export function hasAuthToken(): boolean {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}
