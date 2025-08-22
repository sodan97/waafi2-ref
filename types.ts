
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrls: string[];
  description:string;
  category: string;
  stock: number;
  status: 'active' | 'archived' | 'deleted';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  password: string; // NOTE: In a real app, this should be a securely stored hash
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
}

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName:string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  userId: string | null;
  status: string;
  date: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Reservation {
  productId: number;
  userId: number;
  date: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  date: string;
  productId: number;
}

export interface ApiError {
  message: string;
  status?: number;
}