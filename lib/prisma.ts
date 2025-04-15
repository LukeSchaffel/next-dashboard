// lib/prisma.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Event, Location, Ticket, TicketType } from "@prisma/client";

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
    Tickets: {
      include: {
        TicketType: true,
      },
    },
    TicketTypes: {
      include: {
        Tickets: true,
      },
    },
  },
} as const;

export type EventWithLocation = Event & {
  Location: Location | null;
  Tickets: (Ticket & {
    TicketType: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      quantity: number | null;
    } | null;
  })[];
  TicketTypes: (TicketType & {
    Tickets: Ticket[];
  })[];
};
