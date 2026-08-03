export interface AuthUser {
  id: number;
  name: string;
  email: string;
  image: string | null;
  profile: string | null;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
