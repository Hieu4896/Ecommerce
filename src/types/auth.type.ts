import { ReactNode } from "react";

/**
 * Interface cho thông tin đăng nhập
 */
export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number; // Optional, defaults to 60
}

/**
 * Interface cho response từ API đăng nhập
 */
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Interface cho thông tin user từ API /auth/me
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  birthDate: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  domain: string;
  ip: string;
  address: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    postalCode: string;
    state: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    address: {
      address: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      postalCode: string;
      state: string;
    };
    department: string;
    name: string;
    title: string;
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
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

/**
 * Interface cho authentication context
 */
export interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  error: string | null;
}

/**
 * Props cho AuthProvider
 */
export interface AuthProviderProps {
  children: ReactNode;
}
