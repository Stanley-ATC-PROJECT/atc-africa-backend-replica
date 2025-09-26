import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { adminSeedData, AdminSeedData } from './data/admin.data';

const prisma = new PrismaClient();

export async function seedAdmins(): Promise<void> {
  console.log('🌱 Starting admin seeding...');

  try {
    // Check if any admins already exist
    const existingAdmins = await prisma.user.findMany({
      where: { role: UserRole.admin },
    });

    if (existingAdmins.length > 0) {
      console.log(
        `⚠️  Found ${existingAdmins.length} existing admin(s). Skipping admin seeding.`,
      );
      return;
    }

    // Process each admin data
    for (const adminData of adminSeedData) {
      await seedSingleAdmin(adminData);
    }

    console.log(`✅ Successfully seeded ${adminSeedData.length} admin(s)`);
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    throw error;
  }
}

async function seedSingleAdmin(adminData: AdminSeedData): Promise<void> {
  try {
    // Check if admin with this email already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log(
        `⚠️  Admin with email ${adminData.email} already exists. Skipping.`,
      );
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        password_hash: hashedPassword,
        role: UserRole.admin,
        is_active: true,
        hasChangePassword: false,
        notificationEmail: adminData.notificationEmail,
        bio: adminData.bio,
        organization: adminData.organization,
        phone_number: adminData.phoneNumber,
        user_metadata: adminData.userMetadata,
        is_initial_password: true, // Flag for admin-created accounts
      },
    });

    console.log(
      `✅ Created admin: ${admin.firstName} ${admin.lastName} (${admin.email})`,
    );
  } catch (error) {
    console.error(`❌ Error creating admin ${adminData.email}:`, error);
    throw error;
  }
}

// Function to reset admin data (useful for development)
export async function resetAdmins(): Promise<void> {
  console.log('🗑️  Resetting admin data...');

  try {
    // Delete all admin users
    const deletedAdmins = await prisma.user.deleteMany({
      where: { role: UserRole.admin },
    });

    console.log(`✅ Deleted ${deletedAdmins.count} admin(s)`);
  } catch (error) {
    console.error('❌ Error resetting admins:', error);
    throw error;
  }
}

// Function to update existing admin password (useful for development)
export async function updateAdminPassword(
  email: string,
  newPassword: string,
): Promise<void> {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedAdmin = await prisma.user.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        hasChangePassword: false,
        is_initial_password: true,
      },
    });

    console.log(`✅ Updated password for admin: ${updatedAdmin.email}`);
  } catch (error) {
    console.error(`❌ Error updating admin password for ${email}:`, error);
    throw error;
  }
}

// Export the main seeding function
export default seedAdmins;
