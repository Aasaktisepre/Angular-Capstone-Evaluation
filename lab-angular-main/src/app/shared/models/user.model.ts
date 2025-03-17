export interface User {
  id?: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location: string;
  mobileNumber: string;
  role: 'user' | 'admin';
  adminPin?: string;
  activeTime?: number;
}