/**
 * Interface cho thông tin đăng nhập
 */
export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number; // Optional, defaults to 60
}

/**
 * Interface cho user trong session
 */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  name?: string;
}

/**
 * Props cho LoginForm component
 */
export interface LoginFormProps {
  callbackUrl?: string;
}
