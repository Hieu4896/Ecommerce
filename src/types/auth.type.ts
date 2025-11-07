/**
 * Types cho authentication system
 */

import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Interface cho thông tin đăng nhập
 */
export interface LoginCredentials {
  username: string;
  password: string;
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
  token: string;
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
 * Interface cho JWT token
 */
export interface JWTToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
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
 * Interface cho custom session
 */
export interface CustomSession {
  user: SessionUser;
  expires: string;
  accessToken: string;
  refreshToken: string;
  error?: string;
}

/**
 * Interface cho JWT callback
 */
export interface CustomJWT {
  user?: SessionUser;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Interface cho refresh token response
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

/**
 * Props cho LoginForm component
 */
export interface LoginFormProps {
  callbackUrl?: string;
}

/**
 * Interface mở rộng cho Session để chứa thông tin tùy chỉnh
 */
export interface ExtendedSession {
  user?: SessionUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Interface mở rộng cho JWT để chứa thông tin tùy chỉnh
 */
export interface ExtendedJWT extends JWT {
  user?: SessionUser;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Interface mở rộng cho User để chứa thông tin tùy chỉnh
 */
export interface ExtendedUser extends User {
  username?: string;
  firstName?: string;
  lastName?: string;
  accessToken?: string;
  refreshToken?: string;
}
