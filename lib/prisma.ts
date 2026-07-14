/**
 * Prisma Client Singleton
 *
 * Mencegah multiple PrismaClient instance saat development (hot reload).
 * Pattern ini adalah best practice untuk Next.js + Prisma.
 *
 * Prisma v7: koneksi DB wajib menggunakan driver adapter.
 * Ref: https://pris.ly/d/prisma7-client-config
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
