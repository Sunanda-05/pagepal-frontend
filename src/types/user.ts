export interface BaseUser {
  email: string;
  username: string;
  role: string;
}

export interface AuthUser {
  user: BaseUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
}
