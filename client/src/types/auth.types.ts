export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'cashier' | 'manager' | 'admin' | 'customer';
  store?: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
