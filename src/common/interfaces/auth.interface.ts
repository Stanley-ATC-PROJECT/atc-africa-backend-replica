import { User, UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'password_hash'>;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
