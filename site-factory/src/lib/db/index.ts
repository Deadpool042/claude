import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  const separator = url.includes("?") ? "&" : "?";
  // mariadb driver params: connectionLimit (pool size), acquireTimeout (ms)
  const urlWithPool = `${url}${separator}connectionLimit=10&acquireTimeout=30000`;
  const adapter = new PrismaMariaDb(urlWithPool);
  return new PrismaClient({ adapter });
}

let prisma: PrismaClient;
if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prisma = globalForPrisma.prisma;
} else {
  prisma = createPrismaClient();
}

export { prisma };
