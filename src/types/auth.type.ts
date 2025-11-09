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

/**
 * Interface cho thông tin chi tiết người dùng từ DummyJSON API
 */
export interface UserInfo {
  // Các trường cơ bản
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: "male" | "female";
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;

  // Object lồng nhau - Hair
  hair: {
    color: string;
    type: string;
  };

  // Object lồng nhau - Address
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };

  // Object lồng nhau - Bank
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };

  // Object lồng nhau - Company
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };

  // Các trường khác
  macAddress: string;
  university: string;
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
