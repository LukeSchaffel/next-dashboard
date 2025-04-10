// lib/prisma.ts
import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const eventWithLocationArgs = {
  include: {
    Location: true,
    Tickets: true,
  },
} as const;

export type EventWithLocation = Prisma.EventGetPayload<
  typeof eventWithLocationArgs
>;
