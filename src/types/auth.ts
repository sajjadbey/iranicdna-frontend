export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SignupData {
  email: string;
  password: string;
  password_confirm: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface SigninData {
  email: string;
  password: string;
  turnstile_token?: string;
}

export interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirm?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (data: SignupData) => Promise<void>;
  signin: (data: SigninData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}