import { PrismaClient } from '@prisma/client';
import { seedAdmins } from './seed-admin';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    // Seed admin users
    await seedAdmins();

    // Add other seeding functions here as needed
    // await seedSpeakers();
    // await seedSponsors();
    // await seedEvents();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function
main().catch((error) => {
  console.error('❌ Unexpected error during seeding:', error);
  process.exit(1);
});
