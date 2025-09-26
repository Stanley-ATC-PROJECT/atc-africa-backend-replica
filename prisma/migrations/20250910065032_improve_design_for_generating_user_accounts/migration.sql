/*
  Warnings:

  - You are about to drop the column `approval_date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `approval_status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `users` table. All the data in the column will be lost.
  - Added the required column `notificationEmail` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "approval_date",
DROP COLUMN "approved_by";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "approval_status",
DROP COLUMN "approved_by",
ADD COLUMN     "hasChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_initial_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "notificationEmail" TEXT NOT NULL,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT;

-- DropEnum
DROP TYPE "ApprovalStatus";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
