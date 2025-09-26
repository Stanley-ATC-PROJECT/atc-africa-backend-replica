import { UserRole } from '@prisma/client';

export interface AdminSeedData {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // This will be hashed during seeding
  notificationEmail: string;
  bio?: string;
  organization?: string;
  phoneNumber?: string;
  userMetadata?: Record<string, any>;
}

export const adminSeedData: AdminSeedData[] = [
  {
    email: 'admin@atcafrica.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'AdminPassword123!', // This will be hashed during seeding
    notificationEmail: 'admin@atcafrica.com',
    bio: 'System Administrator for ATC Africa',
    organization: 'ATC Africa',
    phoneNumber: '+234-XXX-XXXX',
  },
];
